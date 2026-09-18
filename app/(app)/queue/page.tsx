"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import {
  FilterBar,
  type SortDirection,
  type StatusFilter,
  type StockFilter,
} from "@/components/FilterBar";
import { QueueTable } from "@/components/queue/QueueTable";
import { StockReminderBanner } from "@/components/queue/StockReminderBanner";
import { Pill } from "@/components/StatusPill";

type Bucket = "action" | "resolved" | "rejected" | "none";

export default function QueuePage() {
  const { actionNeeded, resolvedItems, rejectedItems, noActionItems, bulkEligible, bulkApprove } =
    useStore();
  const [bucket, setBucket] = useState<Bucket>("action");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortDirection>("nearest");

  const filtered = useMemo(() => {
    const list = actionNeeded.filter((i) => {
      if (statusFilter !== "all" && i.classification.state !== statusFilter) return false;
      if (stockFilter === "confirmed" && !i.gate.allowed) return false;
      if (stockFilter === "unconfirmed" && i.gate.allowed) return false;
      return true;
    });
    // actionNeeded already arrives sorted by urgency score (lower = more urgent).
    return sort === "furthest" ? [...list].reverse() : list;
  }, [actionNeeded, statusFilter, stockFilter, sort]);

  const buckets = [
    { id: "action" as const, label: "Action needed", count: actionNeeded.length, tone: "accent" as const },
    { id: "resolved" as const, label: "Resolved", count: resolvedItems.length, tone: "ready" as const },
    { id: "rejected" as const, label: "Rejected", count: rejectedItems.length, tone: "danger" as const },
    { id: "none" as const, label: "No action", count: noActionItems.length, tone: "neutral" as const },
  ];

  const list =
    bucket === "action"
      ? filtered
      : bucket === "resolved"
        ? resolvedItems
        : bucket === "rejected"
          ? rejectedItems
          : noActionItems;

  return (
    <div className="space-y-4">
      <StockReminderBanner />

      <section
        className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {buckets.map((b) => (
            <button key={b.id} onClick={() => setBucket(b.id)} className="transition-transform active:scale-[0.98]">
              <Pill
                tone={bucket === b.id ? b.tone : "neutral"}
                className={bucket === b.id ? "ring-2 ring-[var(--color-accent-border)]" : ""}
              >
                {b.label} · {b.count}
              </Pill>
            </button>
          ))}

          {bucket === "action" && bulkEligible.length > 0 && (
            <button
              onClick={bulkApprove}
              title={bulkEligible.map((i) => i.wheelSet.id).join(", ")}
              className="ml-auto rounded-xl bg-[var(--color-ready)] px-3.5 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Bulk-approve {bulkEligible.length} clean draft{bulkEligible.length === 1 ? "" : "s"}
            </button>
          )}
        </div>

        {bucket === "action" && (
          <div className="mb-4">
            <FilterBar
              status={statusFilter}
              onStatusChange={setStatusFilter}
              stock={stockFilter}
              onStockChange={setStockFilter}
              sort={sort}
              onSortChange={setSort}
            />
            <p className="mt-2 text-[11px] text-[var(--color-ink-faint)]">
              Ranked by urgency — days until the appointment, plus a weight for review tasks and a
              small penalty for unconfirmed stock.
            </p>
          </div>
        )}

        {bucket === "rejected" && (
          <p className="mb-3 text-xs text-[var(--color-ink-soft)]">
            Rejected records are never deleted. A stock-blocked one returns only when stock is
            confirmed and you click the reminder.
          </p>
        )}

        {bucket === "none" && (
          <p className="mb-3 text-xs text-[var(--color-ink-soft)]">
            Nothing recorded on either axle — the system found no work here. Kept visible as proof.
          </p>
        )}

        <QueueTable
          items={list}
          pageSize={bucket === "action" ? 8 : 6}
          showRank={bucket === "action"}
          dimmed={bucket === "none"}
          emptyText={
            bucket === "action"
              ? actionNeeded.length === 0
                ? "Queue clear — every record has been actioned."
                : "No records match the current filters."
              : bucket === "resolved"
                ? "Nothing resolved yet."
                : bucket === "rejected"
                  ? "Nothing rejected yet."
                  : "No untouched records."
          }
        />
      </section>
    </div>
  );
}
