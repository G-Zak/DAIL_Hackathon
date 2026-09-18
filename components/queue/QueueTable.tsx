"use client";

import { useState } from "react";
import { Ban, ChevronRight, Disc3, PackageX } from "lucide-react";
import { useStore } from "@/lib/store";
import { daysUntil } from "@/lib/dates";
import type { QueueItem } from "@/lib/types";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { Pill, SourceTag, StatusPill } from "@/components/StatusPill";
import { UrgencyChip } from "@/components/UrgencyChip";

const COL = {
  set: "min-w-0 flex-1",
  customer: "hidden w-24 shrink-0 lg:block",
  size: "hidden w-28 shrink-0 md:block",
  confidence: "hidden shrink-0 xl:block",
  status: "sm:w-[132px] sm:shrink-0",
  appt: "sm:w-[128px] sm:shrink-0 sm:text-right",
};

export function QueueTable({
  items,
  emptyText = "Nothing here.",
  pageSize = 8,
  showRank,
  dimmed,
}: {
  items: QueueItem[];
  emptyText?: string;
  pageSize?: number;
  showRank?: boolean;
  dimmed?: boolean;
}) {
  const { openRecord, highlightId, exiting, nearestIdsFallback } = useTableDeps();
  const [page, setPage] = useState(1);

  const maxPage = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, maxPage);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] px-4 py-10 text-center">
        <Disc3 className="mx-auto h-6 w-6 text-[var(--color-ink-faint)]" />
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden items-center gap-3 border-b border-[var(--color-border)] px-3 pb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)] sm:flex">
        <span className={COL.set}>Wheel set</span>
        <span className={COL.customer}>Customer</span>
        <span className={COL.size}>Size</span>
        <span className={COL.confidence}>Confidence</span>
        <span className={COL.status}>Status</span>
        <span className={COL.appt}>Appointment</span>
      </div>

      <div>
        {visible.map((item, index) => {
          const { wheelSet, classification, resolution, gate } = item;
          const isExiting = exiting?.id === wheelSet.id;
          const blocked = classification.state === "offer_draft" && !gate.allowed;
          return (
            <button
              key={wheelSet.id}
              onClick={() => openRecord(wheelSet.id)}
              style={{ animationDelay: isExiting ? undefined : `${index * 30}ms` }}
              className={`group flex w-full flex-col gap-2 border-b border-[var(--color-border)] px-3 py-3 text-left transition-colors hover:bg-[var(--color-panel-sunken)] sm:flex-row sm:items-center sm:gap-3 ${
                isExiting ? `animate-exit-${exiting.to}` : "animate-fade-up"
              } ${highlightId === wheelSet.id ? "inject-pulse rounded-xl" : ""} ${dimmed ? "opacity-60" : ""}`}
            >
              <span className={COL.set}>
                <span className="flex items-center gap-2">
                  {showRank && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[var(--color-accent-bg)] text-[10px] font-bold text-[var(--color-accent-ink)]">
                      {(current - 1) * pageSize + index + 1}
                    </span>
                  )}
                  <Disc3 className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)]" />
                  <span className="truncate text-sm font-bold text-[var(--color-ink)]">{wheelSet.id}</span>
                  {wheelSet.inShop && resolution.status === "active" && (
                    <Pill tone="danger" className="!px-1.5 !py-0.5 !text-[10px]">
                      in shop
                    </Pill>
                  )}
                  <SourceTag source={wheelSet.source} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--color-ink-soft)] lg:hidden">
                  {wheelSet.customer_id} · {wheelSet.size}
                </span>
                {blocked && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-review-ink)]">
                    <PackageX className="h-3 w-3" /> Blocked — stock not confirmed
                  </span>
                )}
                {resolution.status === "rejected" && resolution.rejection && (
                  <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-[var(--color-danger-ink)]">
                    <Ban className="h-3 w-3 shrink-0" /> {resolution.rejection.label}
                  </span>
                )}
              </span>

              <span className={`${COL.customer} truncate text-sm text-[var(--color-ink-soft)]`}>
                {wheelSet.customer_id}
              </span>

              <span className={`${COL.size} truncate text-sm text-[var(--color-ink-soft)]`}>
                {wheelSet.size === "unknown" ? (
                  <span className="text-[var(--color-review-ink)]">unknown</span>
                ) : (
                  wheelSet.size
                )}
              </span>

              <span className={COL.confidence}>
                <ConfidenceMeter
                  compact
                  sizeKnown={wheelSet.size !== "unknown"}
                  contactAvailable={wheelSet.contact === "available"}
                  stockOk={gate.stockStatus === "confirmed_enough" || gate.stockStatus === "confirmed_short"}
                  daysAway={daysUntil(wheelSet.appointmentDate)}
                  isNearest={nearestIdsFallback.has(wheelSet.id)}
                />
              </span>

              <span className="flex items-center justify-between gap-2 sm:contents">
                <span className={COL.status}>
                  <StatusPill item={item} />
                </span>
                <span className={`${COL.appt} flex items-center justify-end gap-1`}>
                  <UrgencyChip date={wheelSet.appointmentDate} />
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {maxPage > 1 && (
        <div className="flex items-center justify-end gap-2 pt-3 text-sm">
          <span className="text-[var(--color-ink-soft)]">Page</span>
          <span className="rounded-lg border border-[var(--color-border-strong)] px-3 py-1 font-semibold text-[var(--color-ink)]">
            {current}
          </span>
          <span className="text-[var(--color-ink-soft)]">of {maxPage}</span>
          <div className="ml-1 flex gap-1">
            <button
              onClick={() => setPage(Math.max(1, current - 1))}
              disabled={current === 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-contrast)] transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
            </button>
            <button
              onClick={() => setPage(Math.min(maxPage, current + 1))}
              disabled={current === maxPage}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-contrast)] transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function useTableDeps() {
  const { openRecord, highlightId, exiting, items } = useStore();
  const nearestIdsFallback = new Set(
    [...items]
      .sort((a, b) => a.wheelSet.appointmentDate.localeCompare(b.wheelSet.appointmentDate))
      .slice(0, 2)
      .map((i) => i.wheelSet.id)
  );
  return { openRecord, highlightId, exiting, nearestIdsFallback };
}
