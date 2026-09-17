"use client";

import { useState } from "react";
import { buildProjection, useStore } from "@/lib/store";
import { formatShort, relativeLabel } from "@/lib/dates";
import { DISCOUNT_OPTIONS, formatMAD } from "@/lib/pricing";

/**
 * Revenue as a projection, not earnings: what the offers currently in the queue
 * could bring in, per appointment date, at the demo price list and chosen discount.
 */
export function ProjectionChart() {
  const { items, discountPct, setDiscountPct } = useStore();
  const [hover, setHover] = useState<string | null>(null);

  const { series, cumulative } = buildProjection(items, discountPct);
  const max = Math.max(1, ...series.map((s) => s.total));

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-[var(--color-ink-soft)]">
            Projected revenue from open offers
          </p>
          <p className="text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">
            {formatMAD(cumulative)}
          </p>
          <p className="mt-1 inline-flex items-center rounded-md border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-illustrative-ink)]">
            illustrative estimate, not a real quote
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Discount
          </span>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-0.5 text-xs">
            {DISCOUNT_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDiscountPct(d)}
                className={`rounded-full px-2.5 py-1 font-semibold transition-all ${
                  discountPct === d
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-raised)]"
                }`}
              >
                {d}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {series.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] px-4 py-12 text-center text-sm text-[var(--color-ink-soft)]">
          No open offers to project yet.
        </div>
      ) : (
        <div>
          <div className="flex h-48 items-end gap-2 sm:gap-3">
            {series.map((s, i) => {
              const h = (s.total / max) * 100;
              const active = hover === s.date;
              return (
                <div
                  key={s.date}
                  className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                  onMouseEnter={() => setHover(s.date)}
                  onMouseLeave={() => setHover(null)}
                >
                  {active && (
                    <div className="animate-pop absolute -top-1 z-10 whitespace-nowrap rounded-lg bg-[var(--color-accent)] px-2 py-1 text-[11px] font-bold text-[var(--color-accent-contrast)]">
                      {formatMAD(s.total)} · {s.ids.join(", ")}
                    </div>
                  )}
                  <div className="flex h-36 w-full items-end justify-center">
                    <div
                      className="animate-bar w-full max-w-[28px] rounded-full bg-[var(--color-accent)] transition-opacity"
                      style={{
                        height: `${Math.max(h, 5)}%`,
                        animationDelay: `${i * 40}ms`,
                        opacity: active ? 1 : 0.82,
                      }}
                    />
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-semibold ${
                      active ? "text-[var(--color-accent-ink)]" : "text-[var(--color-ink-faint)]"
                    }`}
                  >
                    {formatShort(s.date).replace(/^\w+ /, "")}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-[var(--color-ink-faint)]">
            By appointment date · next {relativeLabel(series[series.length - 1].date).replace("in ", "")} ·{" "}
            {series.reduce((n, s) => n + s.units, 0)} tyre units across {series.length} date
            {series.length === 1 ? "" : "s"}
          </p>
        </div>
      )}
    </div>
  );
}
