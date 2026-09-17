"use client";

import { AlarmClock, Bell, CheckCheck, PackageCheck, Store, Wrench } from "lucide-react";
import { useStore } from "@/lib/store";
import type { AppNotification, NotificationKind } from "@/lib/types";

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  in_shop: Store,
  new_inspection: Wrench,
  stock_ready: PackageCheck,
  review_task: AlarmClock,
  resolved: CheckCheck,
};

function timeAgo(ts: number): string {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead, markRead, openRecord, unreadCount } = useStore();

  function handleClick(n: AppNotification) {
    markRead(n.id);
    if (n.recordId) {
      openRecord(n.recordId);
      onClose();
    }
  }

  return (
    <div
      className="animate-pop absolute right-0 top-11 z-20 w-[320px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]"
      style={{ boxShadow: "var(--shadow-pop)" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3 py-2.5">
        <p className="text-sm font-bold text-[var(--color-ink)]">
          Notifications{unreadCount > 0 && ` · ${unreadCount}`}
        </p>
        {notifications.length > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-[var(--color-accent-ink)] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-[var(--color-ink-soft)]">
            Nothing new. Flags from the shop floor land here.
          </p>
        )}

        {notifications.map((n) => {
          const Icon = KIND_ICON[n.kind];
          return (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`flex w-full gap-2.5 border-b border-[var(--color-border)] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-[var(--color-panel-sunken)] ${
                n.read ? "opacity-60" : ""
              }`}
            >
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  n.urgent
                    ? "bg-[var(--color-danger-bg)] text-[var(--color-danger-ink)]"
                    : "bg-[var(--color-accent-bg)] text-[var(--color-accent-ink)]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold text-[var(--color-ink)]">{n.title}</span>
                  {n.urgent && (
                    <span className="shrink-0 rounded bg-[var(--color-danger)] px-1 py-0.5 text-[9px] font-bold uppercase text-white">
                      now
                    </span>
                  )}
                  {!n.read && <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-[var(--color-ink-soft)]">
                  {n.body}
                </span>
                <span className="mt-1 block text-[10px] text-[var(--color-ink-faint)]">
                  {timeAgo(n.createdAt)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="border-t border-[var(--color-border)] px-3 py-2 text-[11px] text-[var(--color-ink-faint)]">
        In-app only. Email / push delivery is planned, not built.
      </p>
    </div>
  );
}
