"use client";

import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/monthly", label: "Monthly" },
  { href: "/trends", label: "Trends" },
  { href: "/heatmap", label: "Heatmap" },
  { href: "/prediction", label: "Prediction" },
  { href: "/map-monitor", label: "Map Monitor" },
  { href: "/report", label: "Report" },
];

export default function DashboardShell({
  activePath,
  title,
  eyebrow,
  statusText,
  summary,
  selectedDate,
  setSelectedDate,
  latestRange,
  selectionOptions,
  displayLabel = "Display Date",
  children,
}) {
  const options = selectionOptions ?? summary?.available_dates ?? [];
  const hasSelector = typeof selectedDate === "string" && typeof setSelectedDate === "function";
  const safeStatusText = statusText || "Dashboard ready";
  const isWarning =
    safeStatusText.toLowerCase().includes("unable") ||
    safeStatusText.toLowerCase().includes("error");

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-8 rounded-[32px] border border-slate-200/80 bg-slate-100/90 p-6 shadow-panel">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-xl font-bold text-white shadow-lg shadow-sky-500/20">
              RA
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ops Console</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Rainfall Command</h2>
            </div>
          </div>

          <nav className="grid gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  `inline-flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition 
                   ${activePath === item.href ? 'bg-sky-600 text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.8)]' : 'text-slate-700 hover:bg-slate-200'} `
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Dataset Window</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{latestRange}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{summary ? `${summary.date_count} daily snapshots loaded` : 'Waiting for backend'}</p>
          </section>
        </aside>

        <section className="space-y-6">
          <header className="flex flex-col gap-6 rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-panel sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-sky-600">{eyebrow}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">{title}</h1>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {hasSelector ? (
                <label className="grid gap-2 text-sm text-slate-500">
                  <span className="font-semibold text-slate-700">{displayLabel}</span>
                  <select
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    disabled={!options?.length}
                  >
                    {options?.map((date) => (
                      <option key={date} value={date}>
                        {date}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                <span className={`inline-flex h-3.5 w-3.5 rounded-full ${isWarning ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <span className="text-sm text-slate-600">{safeStatusText}</span>
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
