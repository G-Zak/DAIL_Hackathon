"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { signOut, useSession } from "@/lib/session";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationCenter } from "./NotificationCenter";

export function Topbar({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) {
  const { unreadCount } = useStore();
  const session = useSession();
  const router = useRouter();
  const [panel, setPanel] = useState<"alerts" | "account" | null>(null);

  const displayName = session?.name ?? "Guest";
  const roleLabel = session
    ? session.role === "technician"
      ? "Technician"
      : "Coordinator"
    : "Guest view";

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-canvas)]/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <button onClick={onOpenMenu} aria-label="Open menu" className="text-[var(--color-ink-soft)] lg:hidden">
        <Menu className="h-[18px] w-[18px]" />
      </button>

      <h1 className="truncate text-lg font-bold tracking-tight text-[var(--color-ink)]">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />

        <button
          title="Search — not implemented in this slice"
          aria-label="Search (not implemented)"
          className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-ink-faint)]"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setPanel(panel === "alerts" ? null : "alerts")}
            aria-label={`Notifications (${unreadCount} unread)`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-accent-border)]"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="animate-pop absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {panel === "alerts" && (
            <>
              <button className="fixed inset-0 z-10 cursor-default" aria-label="Close" onClick={() => setPanel(null)} />
              <NotificationCenter onClose={() => setPanel(null)} />
            </>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setPanel(panel === "account" ? null : "account")}
            aria-label="Account"
            className="flex h-9 items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] py-0 pl-1 pr-3 transition-colors hover:border-[var(--color-accent-border)]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-bg)] text-xs font-bold text-[var(--color-accent-ink)]">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden text-xs font-semibold text-[var(--color-ink)] sm:inline">
              {displayName}
            </span>
          </button>

          {panel === "account" && (
            <>
              <button className="fixed inset-0 z-10 cursor-default" aria-label="Close" onClick={() => setPanel(null)} />
              <div
                className="animate-pop absolute right-0 top-11 z-20 w-60 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)]"
                style={{ boxShadow: "var(--shadow-pop)" }}
              >
                <div className="px-3 py-2.5">
                  <p className="text-sm font-bold text-[var(--color-ink)]">{displayName}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{roleLabel}</p>
                </div>
                <div className="border-t border-[var(--color-border)] py-1">
                  <span className="block cursor-not-allowed px-3 py-2 text-sm text-[var(--color-ink-faint)]">
                    Account settings · soon
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-3 py-2 text-left text-sm font-semibold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-bg)]"
                  >
                    Sign out
                  </button>
                </div>
                <p className="border-t border-[var(--color-border)] px-3 py-2 text-[11px] text-[var(--color-ink-faint)]">
                  Demo session — real accounts arrive with Supabase auth.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
