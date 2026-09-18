"use client";

import { useEffect, useState } from "react";
import { Ban, Check, CircleAlert, Disc3, PackageCheck, PackageX, Undo2, X } from "lucide-react";
import { REJECTION_REASONS, useStore } from "@/lib/store";
import { daysUntil, formatLong, relativeLabel } from "@/lib/dates";
import { DISCOUNT_OPTIONS, formatMAD, quoteFor } from "@/lib/pricing";
import type { RejectionReasonCode } from "@/lib/types";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { EvidenceBlock } from "@/components/EvidenceBlock";
import { MessageComposer } from "@/components/MessageComposer";
import { Pill, ReviewReasonPills, SourceTag, StatusPill } from "@/components/StatusPill";
import { UrgencyChip } from "@/components/UrgencyChip";

export function RecordModal() {
  const {
    items,
    openRecordId,
    closeRecord,
    language,
    setLanguage,
    channel,
    setChannel,
    discountPct,
    setDiscountPct,
    editedTexts,
    setEditedText,
    editedSubjects,
    setEditedSubject,
    draftFor,
    approve,
    reject,
    resurrect,
    flagStockNeed,
    stockNeeds,
    reminders,
  } = useStore();

  const [rejecting, setRejecting] = useState(false);
  const [reasonCode, setReasonCode] = useState<RejectionReasonCode>("stock_unconfirmed");

  const item = items.find((i) => i.wheelSet.id === openRecordId) ?? null;

  useEffect(() => {
    if (!openRecordId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRecord();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openRecordId, closeRecord]);

  if (!item) return null;

  const { wheelSet, classification, resolution, gate } = item;
  const live = draftFor(item);
  const resolved = resolution.status !== "active";
  const displayText = resolved ? resolution.sentMessage ?? "" : live.text;
  const displaySubject = resolved ? resolution.sentSubject : live.subject;
  const units = Math.max(1, classification.flaggedAxles.length);
  const quote = quoteFor(wheelSet.size, units, discountPct);
  const alreadyFlagged = stockNeeds.some((s) => s.recordIds.includes(wheelSet.id));
  const reminderForThis = reminders.find((r) => r.recordIds.includes(wheelSet.id));
  const isOffer = classification.state === "offer_draft";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        aria-label="Close"
        onClick={closeRecord}
        className="animate-overlay absolute inset-0 bg-[#0b0b22]/55 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${wheelSet.customer_id} — ${wheelSet.id}`}
        className="animate-pop relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[var(--color-panel)] sm:rounded-3xl"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        <div className="flex items-start gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-bg)]">
            <Disc3 className="h-5 w-5 text-[var(--color-accent-ink)]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight text-[var(--color-ink)]">
                {wheelSet.customer_id}
              </h2>
              <span className="text-sm text-[var(--color-ink-faint)]">{wheelSet.id}</span>
              <SourceTag source={wheelSet.source} />
              {wheelSet.inShop && !resolved && <Pill tone="danger">In shop now</Pill>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusPill item={item} />
              <UrgencyChip date={wheelSet.appointmentDate} showRelative />
              {resolution.resurrectedCount > 0 && (
                <Pill tone="accent"><Undo2 className="h-3 w-3" /> revisited ×{resolution.resurrectedCount}</Pill>
              )}
            </div>
          </div>
          <button
            onClick={closeRecord}
            aria-label="Close"
            className="rounded-lg p-1.5 text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-panel-sunken)]"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
          <ConfidenceMeter
            sizeKnown={wheelSet.size !== "unknown"}
            contactAvailable={wheelSet.contact === "available"}
            stockOk={gate.stockStatus === "confirmed_enough" || gate.stockStatus === "confirmed_short"}
            daysAway={daysUntil(wheelSet.appointmentDate)}
            isNearest={daysUntil(wheelSet.appointmentDate) <= 3}
          />

          {classification.state === "review_task" && !resolved && (
            <div className="rounded-xl border border-[var(--color-review-border)] bg-[var(--color-review-bg)] p-3">
              <p className="mb-1.5 text-sm font-bold text-[var(--color-review-ink)]">
                Review task — {classification.reasons.length} reason
                {classification.reasons.length === 1 ? "" : "s"}, all shown
              </p>
              <ReviewReasonPills reasons={classification.reasons} />
              <p className="mt-2 text-xs text-[var(--color-review-ink)]">
                No offer can be drafted until this is resolved.
              </p>
            </div>
          )}

          {classification.state === "no_action" && !resolved && (
            <div className="rounded-xl border border-[var(--color-noaction-border)] bg-[var(--color-noaction-bg)] p-3 text-sm font-medium text-[var(--color-noaction)]">
              No concern recorded on either axle — nothing to review or offer.
            </div>
          )}

          {/* Hard stock gate */}
          {isOffer && !gate.allowed && !resolved && (
            <div className="rounded-xl border border-[var(--color-review-border)] bg-[var(--color-review-bg)] p-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-review-ink)]">
                <PackageX className="h-4 w-4" /> Contacting blocked
              </p>
              <p className="mt-1 text-xs text-[var(--color-review-ink)]">{gate.reason}</p>
              <button
                onClick={() => flagStockNeed(wheelSet.id)}
                disabled={alreadyFlagged}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-review)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {alreadyFlagged
                  ? `${wheelSet.size} already flagged to stock`
                  : `Flag ${wheelSet.size} to stock (${units} unit${units === 1 ? "" : "s"})`}
              </button>
            </div>
          )}

          {isOffer && gate.allowed && gate.stockStatus === "confirmed_short" && !resolved && (
            <p className="rounded-xl border border-[var(--color-review-border)] bg-[var(--color-review-bg)] px-3 py-2 text-xs font-medium text-[var(--color-review-ink)]">
              <CircleAlert className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
              Fewer units in stock than this record needs — the draft stays cautious about quantity.
            </p>
          )}

          <EvidenceBlock wheelSet={wheelSet} matchedStock={classification.matchedStock} />

          {/* Price + discount */}
          {isOffer && !resolved && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                    Offer price · {units} tyre{units === 1 ? "" : "s"}
                  </p>
                  <p className="text-lg font-extrabold text-[var(--color-ink)]">
                    {formatMAD(quote.total)}
                    {discountPct > 0 && (
                      <span className="ml-2 text-sm font-semibold text-[var(--color-ink-faint)] line-through">
                        {formatMAD(quote.gross)}
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-[var(--color-ink-soft)]">
                    {formatMAD(quote.unit)} per tyre fitted
                    {discountPct > 0 && ` · saves ${formatMAD(quote.saved)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                    Discount
                  </span>
                  <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel)] p-0.5 text-xs">
                    {DISCOUNT_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDiscountPct(d)}
                        className={`rounded-full px-2 py-1 font-semibold transition-all ${
                          discountPct === d
                            ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                            : "text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-raised)]"
                        }`}
                      >
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-2 inline-block rounded-md border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-illustrative-ink)]">
                demo price list — initial.json has no pricing
              </p>
            </div>
          )}

          {resolution.status === "rejected" && (
            <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3">
              <p className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-danger-ink)]">
                <Ban className="h-4 w-4" /> Rejected — {resolution.rejection?.label}
              </p>
              <p className="mt-1 text-xs text-[var(--color-danger-ink)]">
                Kept in the Rejected bin, never deleted. Nothing was sent.
                {resolution.rejection?.stockSize
                  ? ` Blocked on stock for ${resolution.rejection.stockSize}.`
                  : ""}
              </p>
              {reminderForThis ? (
                <button
                  onClick={() => resurrect(wheelSet.id)}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-ready)] px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PackageCheck className="h-3.5 w-3.5" /> Stock confirmed — move back to the queue
                </button>
              ) : resolution.rejection?.code === "stock_unconfirmed" ? (
                <p className="mt-2 text-[11px] text-[var(--color-danger-ink)]/80">
                  Waiting on a stock confirmation for {resolution.rejection.stockSize}.
                </p>
              ) : null}
            </div>
          )}

          {resolution.status === "approved" && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] p-3 text-sm font-bold text-[var(--color-ready-ink)]">
              <Check className="h-4 w-4" /> Approved — message simulated, not actually delivered
              {resolution.resolvedVia === "bulk" ? " (via bulk-approve)" : ""}
              {resolution.resolvedAt && (
                <span className="ml-1 font-medium">
                  · {formatLong(wheelSet.appointmentDate, "en")} appointment ({relativeLabel(wheelSet.appointmentDate)})
                </span>
              )}
            </div>
          )}

          {(isOffer || resolved) && (
            <MessageComposer
              key={`${wheelSet.id}-${resolution.status}`}
              wheelSet={wheelSet}
              text={displayText}
              subject={displaySubject}
              language={resolved ? resolution.sentLanguage ?? language : language}
              onLanguageChange={setLanguage}
              channel={resolved ? resolution.sentChannel ?? channel : channel}
              onChannelChange={setChannel}
              editedText={resolved ? displayText : editedTexts[wheelSet.id] ?? ""}
              onEditedTextChange={(t) => setEditedText(wheelSet.id, t)}
              editedSubject={resolved ? displaySubject ?? "" : editedSubjects[wheelSet.id] ?? ""}
              onEditedSubjectChange={(t) => setEditedSubject(wheelSet.id, t)}
              readOnly={resolved}
            />
          )}
        </div>

        {isOffer && !resolved && (
          <div className="border-t border-[var(--color-border)] px-5 py-3.5">
            {rejecting ? (
              <div className="animate-slide-down space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                  Why are you rejecting this?
                </label>
                <select
                  value={reasonCode}
                  onChange={(e) => setReasonCode(e.target.value as RejectionReasonCode)}
                  className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      reject(wheelSet.id, reasonCode);
                      setRejecting(false);
                    }}
                    className="rounded-xl bg-[var(--color-danger)] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  >
                    Confirm rejection
                  </button>
                  <button
                    onClick={() => setRejecting(false)}
                    className="rounded-xl border border-[var(--color-border-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
                  >
                    Back
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => approve(wheelSet.id)}
                  disabled={!gate.allowed}
                  title={gate.allowed ? undefined : gate.reason ?? undefined}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-[var(--color-accent-contrast)] transition-all hover:bg-[var(--color-accent-strong)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Check className="h-4 w-4" />
                  Approve &amp; send (simulated)
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="rounded-xl border border-[var(--color-danger-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-danger-ink)] transition-colors hover:bg-[var(--color-danger-bg)]"
                >
                  Reject…
                </button>
                <span className="ml-auto text-[11px] text-[var(--color-ink-faint)]">
                  {gate.allowed ? "Nothing sends without this click." : "Blocked until stock is confirmed."}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
