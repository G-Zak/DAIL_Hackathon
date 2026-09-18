import type { WheelSet } from "./types";

/**
 * A real .ics file — this is the one part of the "call" channel that genuinely
 * works offline. The phone number below is a labeled placeholder: initial.json
 * carries no phone numbers, only `contact: available | missing`.
 */
export const DEMO_PHONE = "+212600000000";
export const DEMO_PHONE_DISPLAY = "+212 6 00 00 00 00";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function icsDate(iso: string, hour: number, minute = 0): string {
  const d = new Date(`${iso}T00:00:00`);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(hour)}${pad(minute)}00`;
}

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildCallbackICS(wheelSet: WheelSet, summaryNote: string): string {
  const uid = `${wheelSet.id}-${Date.now()}@tyreflow.demo`;
  const start = icsDate(wheelSet.appointmentDate, 9);
  const end = icsDate(wheelSet.appointmentDate, 9, 30);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TyreFlow//C03 demo//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsDate(wheelSet.appointmentDate, 9)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText(`Tyre call — ${wheelSet.customer_id} (${wheelSet.id})`)}`,
    `DESCRIPTION:${escapeText(summaryNote)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadICS(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
