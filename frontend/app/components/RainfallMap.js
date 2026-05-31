"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

function getMarkerColor(rainfallMm) {
  if (rainfallMm >= 50) return "#0c4a6e";
  if (rainfallMm >= 20) return "#0284c7";
  if (rainfallMm >= 5) return "#38bdf8";
  return "#7dd3fc";
}

function getMarkerRadius(rainfallMm) {
  return Math.max(6, Math.min(18, 6 + rainfallMm / 6));
}

export default function RainfallMap({ points, mapDate }) {
  const resolvedPoints = Array.isArray(points)
    ? points.filter(
        (point) =>
          Number.isFinite(point?.latitude) &&
          Number.isFinite(point?.longitude)
      )
    : [];
  const hasCoordinates = resolvedPoints.length > 0;
  const center = hasCoordinates
    ? [resolvedPoints[0].latitude, resolvedPoints[0].longitude]
    : [12.0, -15.5];

  return (
    <div className="map-shell">
      <div className="map-meta">
        <p className="map-date">Map date: {mapDate || "Unavailable"}</p>
        {hasCoordinates ? (
          <p className="map-note">Each circle shows rainfall at a recorded location for the selected day.</p>
        ) : null}
      </div>
      {hasCoordinates ? (
        <MapContainer key={mapDate || "default"} center={center} zoom={6} scrollWheelZoom className="leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {resolvedPoints.map((point) => (
            <CircleMarker
              key={`${point.latitude}-${point.longitude}`}
              center={[point.latitude, point.longitude]}
              radius={getMarkerRadius(point.rainfall_mm)}
              pathOptions={{
                color: getMarkerColor(point.rainfall_mm),
                fillColor: getMarkerColor(point.rainfall_mm),
                fillOpacity: 0.65,
                weight: 1
              }}
            >
              <Popup>
                <strong>{point.date}</strong>
                <br />
                Rainfall: {Number(point.rainfall_mm).toFixed(2)} mm
                <br />
                Lat: {point.latitude}, Lon: {point.longitude}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
          <p className="text-base font-semibold text-slate-700">Spatial plotting unavailable</p>
          <p className="max-w-md leading-6">
            The current backend dataset includes rainfall values and dates, but it does not include
            latitude/longitude fields for map rendering.
          </p>
        </div>
      )}
    </div>
  );
}
