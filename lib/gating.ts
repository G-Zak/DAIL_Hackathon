import { daysUntil } from "./dates";
import type { ClassificationResult, ContactGate, StockStatus, WheelSet } from "./types";

/**
 * Hard rule: we never contact a customer about a tyre we cannot actually supply.
 *
 * - stock unconfirmed / no matching record  → contacting is BLOCKED. The size is
 *   flagged as a stock need instead, so whoever manages stock can see it.
 * - stock confirmed but fewer units than the record needs → contacting is allowed
 *   with cautious wording (we can start the conversation without overpromising
 *   quantity).
 * - stock confirmed with enough units → contacting is allowed, firm wording.
 *
 * This supersedes the earlier behaviour where an unconfirmed-stock draft could be
 * sent with hedged wording. Cautious wording now covers the short-quantity case.
 *
 * The outreach window does not block contacting; it decides who gets pulled back in
 * automatically once stock lands (see Feature 8). There is no visit history in
 * initial.json, so the window is measured against the appointment date, not a
 * "last visited" field, which would have to be invented.
 */
export function stockStatusFor(
  wheelSet: WheelSet,
  classification: ClassificationResult
): StockStatus {
  const stock = classification.matchedStock;
  if (!stock) return "none";
  if (!stock.confirmed) return "unconfirmed";
  const needed = Math.max(1, classification.flaggedAxles.length);
  return stock.units >= needed ? "confirmed_enough" : "confirmed_short";
}

export function contactGate(
  wheelSet: WheelSet,
  classification: ClassificationResult,
  outreachWindowDays: number
): ContactGate {
  const stockStatus = stockStatusFor(wheelSet, classification);
  const days = daysUntil(wheelSet.appointmentDate);
  const inWindow = days <= outreachWindowDays;

  if (classification.state !== "offer_draft") {
    return {
      allowed: false,
      stockStatus,
      inWindow,
      reason:
        classification.state === "review_task"
          ? "Record is incomplete — resolve the review task first."
          : "Nothing to offer on this record.",
    };
  }

  if (stockStatus === "unconfirmed" || stockStatus === "none") {
    return {
      allowed: false,
      stockStatus,
      inWindow,
      reason:
        stockStatus === "none"
          ? `No stock record for ${wheelSet.size} — flag it so stock can be sourced.`
          : `Stock for ${wheelSet.size} is not confirmed — contacting is blocked until it is.`,
    };
  }

  return { allowed: true, stockStatus, inWindow, reason: null };
}

export function unitsNeeded(classification: ClassificationResult): number {
  return Math.max(1, classification.flaggedAxles.length);
}
