/**
 * initial.json expresses appointments as "Day N" with no calendar anchor. The UI
 * works in real dates, so "Day N" is mapped onto concrete dates counted from the
 * session's start date. The raw "Day N" string is kept on the record for
 * provenance — the supplied values are never rewritten.
 */

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Anchor date used to turn "Day N" into a calendar date. Stable per module load. */
export function todayISO(): string {
  return toISODate(new Date());
}

export function dayNumberToDate(dayNumber: number, anchorISO: string): string {
  // Day 1 == the anchor day itself.
  return addDays(anchorISO, Math.max(0, dayNumber - 1));
}

export function daysUntil(iso: string, fromISO = todayISO()): number {
  const a = new Date(`${fromISO}T00:00:00`).getTime();
  const b = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

const SHORT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const LONG: Record<string, Intl.DateTimeFormat> = {
  en: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }),
  fr: new Intl.DateTimeFormat("fr-MA", { weekday: "long", day: "numeric", month: "long" }),
  ar: new Intl.DateTimeFormat("ar-MA", { weekday: "long", day: "numeric", month: "long" }),
};

export function formatShort(iso: string): string {
  if (!iso) return "—";
  return SHORT.format(new Date(`${iso}T00:00:00`));
}

export function formatLong(iso: string, language: "en" | "fr" | "ar" = "en"): string {
  if (!iso) return "—";
  return (LONG[language] ?? LONG.en).format(new Date(`${iso}T00:00:00`));
}

/** "in 4 days" / "tomorrow" / "today" / "3 days ago" — relative to now. */
export function relativeLabel(iso: string): string {
  const n = daysUntil(iso);
  if (n === 0) return "today";
  if (n === 1) return "tomorrow";
  if (n === -1) return "yesterday";
  if (n > 1) return `in ${n} days`;
  return `${Math.abs(n)} days ago`;
}
