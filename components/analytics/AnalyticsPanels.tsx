"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

import { Disc3 } from "lucide-react";
import { ClassificationPill } from "@/components/StatusPill";
import { UrgencyChip } from "@/components/UrgencyChip";

export function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section
      className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-sm font-bold text-[var(--color-ink)]">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function StatusBreakdown() {
  const { items } = useStore();
  const counts = { offer_draft: 0, review_task: 0, no_action: 0 };
  for (const item of items) counts[item.classification.state]++;
  const total = items.length || 1;

  const rows = [
    { state: "offer_draft" as const, color: "var(--color-ready)" },
    { state: "review_task" as const, color: "var(--color-review)" },
    { state: "no_action" as const, color: "var(--color-noaction)" },
  ];

  return (
    <Card title="Status breakdown" subtitle="How every wheel set classifies right now">
      <div className="space-y-3">
        {rows.map(({ state, color }) => (
          <div key={state}>
            <div className="mb-1.5 flex items-center justify-between">
              <ClassificationPill state={state} />
              <span className="text-sm font-bold text-[var(--color-ink)]">{counts[state]}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--color-panel-sunken)]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(counts[state] / total) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function StockDemandSupply() {
  const { items, availability } = useStore();
  const sizes = new Map<string, { demand: number; confirmed: number; unconfirmed: number }>();
  const ensure = (size: string) => {
    if (!sizes.has(size)) sizes.set(size, { demand: 0, confirmed: 0, unconfirmed: 0 });
    return sizes.get(size)!;
  };

  for (const item of items) {
    if (item.classification.flaggedAxles.length > 0 && item.wheelSet.size !== "unknown") {
      ensure(item.wheelSet.size).demand += 1;
    }
  }
  for (const stock of availability) {
    const entry = ensure(stock.size);
    if (stock.confirmed) entry.confirmed += stock.units;
    else entry.unconfirmed += stock.units;
  }

  const rows = Array.from(sizes.entries()).sort((a, b) => b[1].demand - a[1].demand);

  return (
    <Card title="Stock demand vs. supply" subtitle="Flagged wheel sets per size against units on record">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
            <th className="pb-2">Size</th>
            <th className="pb-2">Demand</th>
            <th className="pb-2">Confirmed</th>
            <th className="pb-2">Unconfirmed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([size, r]) => {
            const short = r.demand > r.confirmed + r.unconfirmed;
            return (
              <tr key={size} className="border-t border-[var(--color-border)]">
                <td className="py-2 font-semibold text-[var(--color-ink)]">{size}</td>
                <td className={`py-2 ${short ? "font-bold text-[var(--color-review-ink)]" : "text-[var(--color-ink-soft)]"}`}>
                  {r.demand}
                </td>
                <td className="py-2 font-semibold text-[var(--color-ready-ink)]">{r.confirmed}</td>
                <td className="py-2 font-semibold text-[var(--color-review-ink)]">{r.unconfirmed}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

export function UrgencyTimeline() {
  const { items, openRecord } = useStore();
  const sorted = [...items].sort((a, b) =>
    a.wheelSet.appointmentDate.localeCompare(b.wheelSet.appointmentDate)
  );

  return (
    <Card title="Urgency timeline" subtitle="Every record by appointment, nearest first">
      <ol className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
        {sorted.map((item) => (
          <li key={item.wheelSet.id}>
            <button
              onClick={() => openRecord(item.wheelSet.id)}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-3 py-2 text-left transition-colors hover:border-[var(--color-accent-border)]"
            >
              <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-[var(--color-ink)]">
                <Disc3 className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-faint)]" />
                {item.wheelSet.customer_id}{" "}
                <span className="text-[var(--color-ink-faint)]">/ {item.wheelSet.id}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <ClassificationPill state={item.classification.state} />
                <UrgencyChip date={item.wheelSet.appointmentDate} />
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function ReviewReasonBreakdown() {
  const { items } = useStore();
  let measurementOnly = 0;
  let contactOnly = 0;
  let both = 0;

  for (const item of items) {
    if (item.classification.state !== "review_task") continue;
    const codes = new Set(item.classification.reasons.map((r) => r.code));
    const hasSize = codes.has("unknown_size");
    const hasContact = codes.has("missing_contact");
    if (hasSize && hasContact) both += 1;
    else if (hasSize) measurementOnly += 1;
    else if (hasContact) contactOnly += 1;
  }

  const cells = [
    { label: "Missing measurement only", value: measurementOnly },
    { label: "Missing contact only", value: contactOnly },
    { label: "Both", value: both },
  ];

  return (
    <Card title="Review task reasons" subtitle="Never collapsed into one generic label">
      <div className="grid grid-cols-3 gap-3">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--color-review-border)] bg-[var(--color-review-bg)] p-3 text-center"
          >
            <p className="text-2xl font-extrabold text-[var(--color-review-ink)]">{c.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-[var(--color-review-ink)]">{c.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
