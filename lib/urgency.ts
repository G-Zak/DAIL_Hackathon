import { daysUntil } from "./dates";
import { urgencyBand } from "./priority";

// Amber -> red as the appointment nears. Hue is computed here; saturation and
// lightness come from theme-aware CSS variables so one hsl() string works in both.
const URGENT_DAYS = 2;
const CALM_DAYS = 10;
const URGENT_HUE = 4; // red
const CALM_HUE = 38; // amber

export interface UrgencyStyle {
  label: string;
  hue: number;
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export function urgencyStyle(appointmentDate: string): UrgencyStyle {
  const days = daysUntil(appointmentDate);
  const clamped = Math.min(Math.max(days, URGENT_DAYS), CALM_DAYS);
  const t = (clamped - URGENT_DAYS) / (CALM_DAYS - URGENT_DAYS);
  const hue = URGENT_HUE + t * (CALM_HUE - URGENT_HUE);

  const band = urgencyBand(days);
  const label =
    band === "overdue"
      ? "Appointment has passed"
      : band === "critical"
        ? "Very soon"
        : band === "soon"
          ? "Approaching"
          : "Further out";

  return {
    label,
    hue,
    bg: `hsl(${hue} var(--urgency-bg-s) var(--urgency-bg-l))`,
    border: `hsl(${hue} var(--urgency-border-s) var(--urgency-border-l))`,
    text: `hsl(${hue} var(--urgency-text-s) var(--urgency-text-l))`,
    dot: `hsl(${hue} var(--urgency-dot-s) var(--urgency-dot-l))`,
  };
}

/** IDs of the `count` records with the nearest appointment across the dataset. */
export function nearestAppointmentIds<T extends { id: string; appointmentDate: string }>(
  records: T[],
  count: number
): Set<string> {
  const sorted = [...records].sort((a, b) => a.appointmentDate.localeCompare(b.appointmentDate));
  return new Set(sorted.slice(0, count).map((r) => r.id));
}
