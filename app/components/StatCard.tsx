import type { LucideIcon } from "lucide-react";

export function StatCard({
  Icon,
  label,
  value,
  hint,
  index = 0,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  index?: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-4 transition-transform hover:-translate-y-0.5"
      style={{ boxShadow: "var(--shadow-card)", animationDelay: `${index * 50}ms` }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-panel-sunken)] text-[var(--color-ink-soft)]">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-3 text-xs font-medium text-[var(--color-ink-soft)]">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-[var(--color-ink)]">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">{hint}</p>}
    </div>
  );
}
