import { daysUntil } from "./dates";
import type { ClassificationResult, ContactGate, StockStatus, WheelSet } from "./types";

/**
 * Urgency score — lower is more urgent.
 *
 *   score = days_until_appointment + state_weight + stock_penalty
 *
 * The stock penalty is deliberately fractional: unconfirmed stock nudges a record
 * down but never past a record whose appointment is a full day later. On the
 * supplied data that yields TY-3 (4.5) → TY-1 (5) → TY-2 (8), with TY-4 excluded
 * from "Action needed" entirely.
 */
const STATE_WEIGHT: Record<ClassificationResult["state"], number> = {
  offer_draft: 0,
  review_task: 2,
  no_action: 999,
};

const STOCK_PENALTY: Record<StockStatus, number> = {
  confirmed_enough: 0,
  confirmed_short: 0.25,
  unconfirmed: 0.5,
  none: 0.75,
};

export function urgencyScore(
  wheelSet: WheelSet,
  classification: ClassificationResult,
  gate: ContactGate
): number {
  const days = daysUntil(wheelSet.appointmentDate);
  return days + STATE_WEIGHT[classification.state] + STOCK_PENALTY[gate.stockStatus];
}

export function urgencyBand(days: number): "overdue" | "critical" | "soon" | "later" {
  if (days < 0) return "overdue";
  if (days <= 3) return "critical";
  if (days <= 7) return "soon";
  return "later";
}
