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
  const resolvedPoints = Array.isArray(points) ? points : [];
  const center = resolvedPoints.length
    ? [resolvedPoints[0].latitude, resolvedPoints[0].longitude]
    : [12.0, -15.5];

  return (
    <div className="map-shell">
      <div className="map-meta">
        <p className="map-date">Map date: {mapDate || "Unavailable"}</p>
        <p className="map-note">Each circle shows rainfall at a recorded location for the selected day.</p>
      </div>
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
    </div>
  );
}
