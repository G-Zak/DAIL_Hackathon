import { dayNumberToDate, todayISO } from "./dates";
import type { SeedData, WheelSet } from "./types";

/**
 * Ground truth (`source: "initial.json"`) is verbatim initial.json — TY-1..TY-4 and
 * ST-1/ST-2 field values are never altered. `appointmentDate` is *derived* from the
 * supplied "Day N" string against today's date so the UI can work in real dates;
 * the original string stays on the record.
 *
 * `source: "simulated"` rows are added demo volume, labeled as such in the UI.
 */
const ANCHOR = todayISO();

type RawWheelSet = Omit<WheelSet, "appointmentDate"> & { dayNumber: number };

const RAW: RawWheelSet[] = [
  // ---- Ground truth, verbatim from initial.json ----
  { id: "TY-1", customer_id: "CUS-1", front: "review replacement", rear: "no concern recorded", size: "205/55 R16", appointment: "Day 5", dayNumber: 5, contact: "available", source: "initial.json" },
  { id: "TY-2", customer_id: "CUS-2", front: "measurement missing", rear: "no concern recorded", size: "unknown", appointment: "Day 6", dayNumber: 6, contact: "missing", source: "initial.json" },
  { id: "TY-3", customer_id: "CUS-3", front: "review replacement", rear: "review replacement", size: "225/45 R17", appointment: "Day 4", dayNumber: 4, contact: "available", source: "initial.json" },
  { id: "TY-4", customer_id: "CUS-4", front: "no concern recorded", rear: "no concern recorded", size: "205/55 R16", appointment: "Day 7", dayNumber: 7, contact: "available", source: "initial.json" },

  // ---- Added demo volume (labeled simulated everywhere it appears) ----
  { id: "TY-5", customer_id: "CUS-5", front: "review replacement", rear: "no concern recorded", size: "195/65 R15", appointment: "Day 2", dayNumber: 2, contact: "available", source: "simulated" },
  { id: "TY-6", customer_id: "CUS-6", front: "review replacement", rear: "review replacement", size: "215/60 R16", appointment: "Day 3", dayNumber: 3, contact: "available", source: "simulated" },
  { id: "TY-7", customer_id: "CUS-7", front: "measurement missing", rear: "no concern recorded", size: "unknown", appointment: "Day 8", dayNumber: 8, contact: "available", source: "simulated" },
  { id: "TY-8", customer_id: "CUS-8", front: "no concern recorded", rear: "review replacement", size: "235/40 R18", appointment: "Day 9", dayNumber: 9, contact: "missing", source: "simulated" },
  { id: "TY-9", customer_id: "CUS-9", front: "no concern recorded", rear: "no concern recorded", size: "195/65 R15", appointment: "Day 10", dayNumber: 10, contact: "available", source: "simulated" },
  { id: "TY-10", customer_id: "CUS-10", front: "review replacement", rear: "no concern recorded", size: "205/55 R16", appointment: "Day 6", dayNumber: 6, contact: "available", source: "simulated" },
  { id: "TY-11", customer_id: "CUS-11", front: "review replacement", rear: "review replacement", size: "235/40 R18", appointment: "Day 11", dayNumber: 11, contact: "available", source: "simulated" },
  { id: "TY-12", customer_id: "CUS-12", front: "review replacement", rear: "no concern recorded", size: "215/60 R16", appointment: "Day 12", dayNumber: 12, contact: "missing", source: "simulated" },
  { id: "TY-13", customer_id: "CUS-13", front: "no concern recorded", rear: "no concern recorded", size: "225/45 R17", appointment: "Day 20", dayNumber: 20, contact: "available", source: "simulated" },
  { id: "TY-14", customer_id: "CUS-14", front: "review replacement", rear: "no concern recorded", size: "195/65 R15", appointment: "Day 24", dayNumber: 24, contact: "available", source: "simulated" },
];

export const SEED_DATA: SeedData = {
  case_id: "C03",
  data_status: "SYNTHETIC EXERCISE DATA; not real client, country, programme or participant data",
  clock: "Exercise-local time only; no real event date implied",
  wheel_sets: RAW.map(({ dayNumber, ...rest }) => ({
    ...rest,
    appointmentDate: dayNumberToDate(dayNumber, ANCHOR),
  })),
  availability: [
    // ---- Ground truth, verbatim from initial.json ----
    { id: "ST-1", size: "205/55 R16", units: 2, confirmed: true, source: "initial.json" },
    { id: "ST-2", size: "225/45 R17", units: 4, confirmed: false, source: "initial.json" },
    // ---- Added demo stock (labeled simulated) ----
    { id: "ST-3", size: "195/65 R15", units: 6, confirmed: true, source: "simulated" },
    { id: "ST-4", size: "215/60 R16", units: 1, confirmed: true, source: "simulated" },
    { id: "ST-5", size: "235/40 R18", units: 2, confirmed: false, source: "simulated" },
  ],
  rules: [
    "A technician approves fitment and required quantity.",
    "Unknown measurements create a review task.",
    "Only approved offers may become customer messages.",
  ],
};

export const KNOWN_SIZES = ["205/55 R16", "225/45 R17", "195/65 R15", "215/60 R16", "235/40 R18"];

export const AXLE_CONDITIONS = ["review replacement", "no concern recorded", "measurement missing"];

export function cloneSeedData(): SeedData {
  return JSON.parse(JSON.stringify(SEED_DATA)) as SeedData;
}
