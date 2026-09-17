import { Calendar, Check, Clock, X } from "lucide-react";

type Tone = "pass" | "fail" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  pass: "border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] text-[var(--color-ready-ink)]",
  fail: "border-[var(--color-review-border)] bg-[var(--color-review-bg)] text-[var(--color-review-ink)]",
  neutral: "border-[var(--color-noaction-border)] bg-[var(--color-noaction-bg)] text-[var(--color-noaction)]",
};

function Indicator({
  Icon,
  label,
  tone,
  compact,
}: {
  Icon: typeof Check;
  label: string;
  tone: Tone;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-lg border ${TONE_CLASS[tone]}`}
        title={label}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${TONE_CLASS[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

/**
 * The four things the classifier and the stock gate actually reason about.
 * Urgency is relative to today, so it re-reads live as appointments move.
 */
export function ConfidenceMeter({
  sizeKnown,
  contactAvailable,
  stockOk,
  daysAway,
  isNearest,
  compact,
}: {
  sizeKnown: boolean;
  contactAvailable: boolean;
  stockOk: boolean;
  daysAway: number;
  isNearest: boolean;
  compact?: boolean;
}) {
  const dayLabel =
    daysAway < 0
      ? `${Math.abs(daysAway)} days overdue`
      : daysAway === 0
        ? "Today"
        : daysAway === 1
          ? "Tomorrow"
          : `In ${daysAway} days`;
  const urgent = isNearest || daysAway <= 3;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Indicator
        Icon={sizeKnown ? Check : X}
        label="Size known"
        tone={sizeKnown ? "pass" : "fail"}
        compact={compact}
      />
      <Indicator
        Icon={contactAvailable ? Check : X}
        label="Contact available"
        tone={contactAvailable ? "pass" : "fail"}
        compact={compact}
      />
      <Indicator
        Icon={stockOk ? Check : X}
        label="Stock confirmed"
        tone={stockOk ? "pass" : "fail"}
        compact={compact}
      />
      <Indicator
        Icon={urgent ? Clock : Calendar}
        label={dayLabel}
        tone={urgent ? "fail" : "neutral"}
        compact={compact}
      />
    </div>
  );
}
