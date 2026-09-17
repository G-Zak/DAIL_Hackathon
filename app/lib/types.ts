// Core domain types for C03 — Tyre Inspection → Offer Workflow.
// The ground-truth fields mirror initial.json exactly. Everything else is
// provenance, scheduling or UI metadata — never invented customer attributes.

export type ContactAvailability = "available" | "missing";

export type RecordSource = "initial.json" | "simulated" | "technician";

export interface WheelSet {
  id: string;
  customer_id: string;
  front: string;
  rear: string;
  size: string;
  /** Raw supplied value, e.g. "Day 5". Kept verbatim for provenance. */
  appointment: string;
  /** Concrete calendar date (ISO yyyy-mm-dd) the UI actually works in. */
  appointmentDate: string;
  contact: ContactAvailability;
  source: RecordSource;
  recordedBy?: string;
  /** Technician flag: the customer is physically in the shop right now. */
  inShop?: boolean;
  createdAt?: number;
}

export interface Availability {
  id: string;
  size: string;
  units: number;
  confirmed: boolean;
  source: RecordSource;
}

export interface SeedData {
  case_id: string;
  data_status: string;
  clock: string;
  wheel_sets: WheelSet[];
  availability: Availability[];
  rules: string[];
}

export type ClassificationState = "offer_draft" | "review_task" | "no_action";

export type ReviewReasonCode = "unknown_size" | "missing_contact";

export interface ReviewReason {
  code: ReviewReasonCode;
  label: string;
}

export interface ClassificationResult {
  state: ClassificationState;
  reasons: ReviewReason[];
  flaggedAxles: Array<"front" | "rear">;
  matchedStock: Availability | null;
}

/** How stock stands for a record — drives whether contacting is allowed at all. */
export type StockStatus = "confirmed_enough" | "confirmed_short" | "unconfirmed" | "none";

/** Whether the coordinator is allowed to contact this customer right now. */
export interface ContactGate {
  allowed: boolean;
  stockStatus: StockStatus;
  /** Appointment falls inside the outreach window (settings.outreachWindowDays). */
  inWindow: boolean;
  reason: string | null;
}

export type ResolutionStatus = "active" | "approved" | "rejected";

export type RejectionReasonCode =
  | "stock_unconfirmed"
  | "customer_declined"
  | "wrong_record"
  | "other";

export interface RejectionInfo {
  code: RejectionReasonCode;
  label: string;
  stockSize: string | null;
  rejectedAt: number;
}

export interface Resolution {
  status: ResolutionStatus;
  sentMessage: string | null;
  sentSubject: string | null;
  sentLanguage: DraftLanguage | null;
  sentChannel: Channel | null;
  resolvedVia: "single" | "bulk" | null;
  resolvedAt: number | null;
  rejection: RejectionInfo | null;
  resurrectedCount: number;
}

export type DraftLanguage = "fr" | "ar" | "en";
export type Channel = "whatsapp" | "sms" | "email" | "call";

export interface QueueItem {
  wheelSet: WheelSet;
  classification: ClassificationResult;
  resolution: Resolution;
  gate: ContactGate;
  /** Lower = more urgent. days_until_appointment + state_weight + stock_penalty. */
  priority: number;
}

/** Raised when a record needs a size the shop cannot currently promise. */
export interface StockNeed {
  size: string;
  recordIds: string[];
  unitsNeeded: number;
  flaggedAt: number;
}

export type NotificationKind =
  | "in_shop"
  | "new_inspection"
  | "stock_ready"
  | "review_task"
  | "resolved";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  recordId: string | null;
  createdAt: number;
  read: boolean;
  urgent: boolean;
}

export interface MessageTemplate {
  subject?: string;
  body: string;
}

export type TemplateMap = Record<Channel, Record<DraftLanguage, MessageTemplate>>;

export interface Settings {
  defaultLanguage: DraftLanguage;
  defaultChannel: Channel;
  /** Only customers with an appointment inside this many days get stock-ready outreach. */
  outreachWindowDays: number;
  discountPct: number;
  templates: TemplateMap;
}

export type Role = "technician" | "coordinator";

export interface Session {
  role: Role;
  name: string;
}
