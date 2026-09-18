import { TriangleAlert } from "lucide-react";
import type { QueueItem, ClassificationState } from "@/lib/types";

export type Tone = "ready" | "review" | "neutral" | "accent" | "danger";

const TONE_CLASS: Record<Tone, string> = {
  ready: "border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] text-[var(--color-ready-ink)]",
  review: "border-[var(--color-review-border)] bg-[var(--color-review-bg)] text-[var(--color-review-ink)]",
  neutral: "border-[var(--color-noaction-border)] bg-[var(--color-noaction-bg)] text-[var(--color-noaction)]",
  accent: "border-[var(--color-accent-border)] bg-[var(--color-accent-bg)] text-[var(--color-accent-ink)]",
  danger: "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] text-[var(--color-danger-ink)]",
};

export function Pill({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const STATE: Record<ClassificationState, { label: string; tone: Tone }> = {
  offer_draft: { label: "Offer Draft", tone: "ready" },
  review_task: { label: "Review Task", tone: "review" },
  no_action: { label: "No Action", tone: "neutral" },
};

/** The single badge a row shows: resolution wins over classification when resolved. */
export function StatusPill({ item }: { item: QueueItem }) {
  if (item.resolution.status === "approved") return <Pill tone="accent">Approved</Pill>;
  if (item.resolution.status === "rejected") return <Pill tone="danger">Rejected</Pill>;
  const s = STATE[item.classification.state];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function ClassificationPill({ state }: { state: ClassificationState }) {
  const s = STATE[state];
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function ReviewReasonPills({ reasons }: { reasons: QueueItem["classification"]["reasons"] }) {
  if (reasons.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasons.map((reason) => (
        <span
          key={reason.code}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-review-border)] bg-[var(--color-panel)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--color-review-ink)]"
        >
          <TriangleAlert className="h-3 w-3" /> {reason.label}
        </span>
      ))}
    </div>
  );
}

export function SourceTag({ source }: { source: QueueItem["wheelSet"]["source"] }) {
  if (source === "initial.json") return null;
  return (
    <span
      title={
        source === "technician"
          ? "Logged through the technician form in this session"
          : "Added demo volume — not part of the supplied initial.json"
      }
      className="inline-flex items-center rounded-md border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-illustrative-ink)]"
    >
      {source === "technician" ? "technician-entered" : "simulated"}
    </span>
  );
}
