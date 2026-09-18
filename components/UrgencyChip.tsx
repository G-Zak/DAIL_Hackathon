import { formatShort, relativeLabel } from "@/lib/dates";
import { urgencyStyle } from "@/lib/urgency";

export function UrgencyChip({ date, showRelative }: { date: string; showRelative?: boolean }) {
  const style = urgencyStyle(date);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{ background: style.bg, borderColor: style.border, color: style.text }}
      title={`${style.label} · ${relativeLabel(date)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: style.dot }} />
      {formatShort(date)}
      {showRelative && (
        <span className="font-medium opacity-80">· {relativeLabel(date)}</span>
      )}
    </span>
  );
}
