"use client";

import { useStore } from "@/lib/store";
import { PackageCheck, Undo2, X } from "lucide-react";

/**
 * Feature 8 — raised when a stock size flips to confirmed while a record sits in
 * the Rejected bin for that same size. Nothing moves on its own: the coordinator
 * clicks, same as every other state change in this app.
 */
export function StockReminderBanner() {
  const { reminders, resurrect, dismissReminder } = useStore();
  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="animate-slide-down flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] px-4 py-3"
        >
          <PackageCheck className="h-5 w-5 shrink-0 text-[var(--color-ready-ink)]" />
          <p className="min-w-0 flex-1 text-sm font-semibold text-[var(--color-ready-ink)]">
            Stock for {reminder.size} is now confirmed —{" "}
            {reminder.recordIds.join(", ")} {reminder.recordIds.length === 1 ? "offer is" : "offers are"}{" "}
            ready to revisit.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {reminder.recordIds.map((id) => (
              <button
                key={id}
                onClick={() => resurrect(id)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-ready)] px-3 py-2 text-xs font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <Undo2 className="h-3.5 w-3.5" /> Move {id} back to the queue
              </button>
            ))}
            <button
              onClick={() => dismissReminder(reminder.id)}
              aria-label="Dismiss reminder"
              className="rounded-lg p-1.5 text-[var(--color-ready-ink)] transition-colors hover:bg-[var(--color-panel)]/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
