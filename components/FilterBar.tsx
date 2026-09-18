"use client";

import type { ClassificationState } from "@/lib/types";

export type StatusFilter = "all" | ClassificationState;
export type StockFilter = "all" | "confirmed" | "unconfirmed";
export type SortDirection = "nearest" | "furthest";

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "offer_draft", label: "Offer Draft" },
  { value: "review_task", label: "Review Task" },
  { value: "no_action", label: "No Action" },
];

const STOCK_OPTIONS: Array<{ value: StockFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "unconfirmed", label: "Unconfirmed" },
];

const SORT_OPTIONS: Array<{ value: SortDirection; label: string }> = [
  { value: "nearest", label: "Nearest first" },
  { value: "furthest", label: "Furthest first" },
];

function Group<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
        {label}
      </span>
      <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-0.5 text-xs">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-2.5 py-1 font-semibold transition-all ${
              value === opt.value
                ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                : "text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-raised)]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({
  status,
  onStatusChange,
  stock,
  onStockChange,
  sort,
  onSortChange,
}: {
  status: StatusFilter;
  onStatusChange: (v: StatusFilter) => void;
  stock: StockFilter;
  onStockChange: (v: StockFilter) => void;
  sort: SortDirection;
  onSortChange: (v: SortDirection) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <Group label="Status" value={status} onChange={onStatusChange} options={STATUS_OPTIONS} />
      <Group label="Stock" value={stock} onChange={onStockChange} options={STOCK_OPTIONS} />
      <Group label="Urgency" value={sort} onChange={onSortChange} options={SORT_OPTIONS} />
    </div>
  );
}
