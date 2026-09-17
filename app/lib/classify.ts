import type { Availability, ClassificationResult, WheelSet } from "./types";

const REVIEW_REPLACEMENT = "review replacement";
const NO_CONCERN = "no concern recorded";
const UNKNOWN_SIZE = "unknown";

/**
 * Classification engine — implements SRS/master-prompt §4 exactly.
 *
 * 1. Offer Draft: (front OR rear === "review replacement") AND size known AND contact === "available".
 * 2. Review Task: size === "unknown" OR contact === "missing". Every applicable reason is reported,
 *    never collapsed into a single generic label.
 * 3. No Action: front AND rear both === "no concern recorded".
 *
 * Priority is Offer Draft, then Review Task, then No Action: for the supplied data these three
 * conditions are mutually exclusive by construction, so priority only matters for hypothetical
 * records outside the ground-truth set (e.g. injected demo state).
 */
export function classifyWheelSet(
  wheelSet: WheelSet,
  availability: Availability[]
): ClassificationResult {
  const flaggedAxles: Array<"front" | "rear"> = [];
  if (wheelSet.front === REVIEW_REPLACEMENT) flaggedAxles.push("front");
  if (wheelSet.rear === REVIEW_REPLACEMENT) flaggedAxles.push("rear");

  const sizeUnknown = wheelSet.size === UNKNOWN_SIZE;
  const contactMissing = wheelSet.contact === "missing";
  const matchedStock =
    availability.find((entry) => entry.size === wheelSet.size) ?? null;

  const isOfferDraft = flaggedAxles.length > 0 && !sizeUnknown && !contactMissing;
  const isReviewTask = sizeUnknown || contactMissing;
  const isNoAction = wheelSet.front === NO_CONCERN && wheelSet.rear === NO_CONCERN;

  if (isOfferDraft) {
    return { state: "offer_draft", reasons: [], flaggedAxles, matchedStock };
  }

  if (isReviewTask) {
    const reasons: ClassificationResult["reasons"] = [];
    if (sizeUnknown) {
      reasons.push({ code: "unknown_size", label: "Measurement missing" });
    }
    if (contactMissing) {
      reasons.push({ code: "missing_contact", label: "Contact unreachable" });
    }
    return { state: "review_task", reasons, flaggedAxles, matchedStock };
  }

  if (isNoAction) {
    return { state: "no_action", reasons: [], flaggedAxles, matchedStock };
  }

  // Defensive fallback for a hypothetical record matching none of the three conditions
  // (cannot occur for the supplied ground-truth data or the demo's injectable fields).
  return {
    state: "review_task",
    reasons: [{ code: "unknown_size", label: "Unrecognized condition — needs manual review" }],
    flaggedAxles,
    matchedStock,
  };
}
