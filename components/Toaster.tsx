"use client";

import { Ban, Check, Info, type LucideIcon } from "lucide-react";
import { useStore } from "@/lib/store";

const TONE: Record<string, string> = {
  success: "border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] text-[var(--color-ready-ink)]",
  danger: "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-ink)]",
  info: "border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent-ink)]",
};

const ICON: Record<string, LucideIcon> = { success: Check, danger: Ban, info: Info };

export function Toaster() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div
      role="status"
      className={`animate-pop fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold ${TONE[toast.tone]}`}
      style={{ boxShadow: "var(--shadow-pop)" }}
    >
      {(() => {
        const Icon = ICON[toast.tone];
        return <Icon className="h-4 w-4 shrink-0" />;
      })()}
      <span className="truncate">{toast.text}</span>
    </div>
  );
}
