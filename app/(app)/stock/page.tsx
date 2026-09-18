"use client";

import { Boxes, Disc3, PackageCheck, PackageX } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatShort } from "@/lib/dates";
import { Pill } from "@/components/StatusPill";

/**
 * The stock side of the gate: sizes that are holding offers up, so whoever manages
 * stock can see exactly which tyre is needed and for whom.
 */
export default function StockPage() {
  const { stockNeeds, availability, blockedByStock, applyStockConfirmed, openRecord, items } =
    useStore();

  const needBySize = new Map(stockNeeds.map((s) => [s.size, s]));

  return (
    <div className="space-y-4">
      <section
        className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
          <PackageX className="h-4 w-4 text-[var(--color-review-ink)]" />
          Flagged stock needs
        </h2>
        <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
          Raised by the coordinator when an offer is blocked. Confirming a size unblocks contacting
          automatically — the message still needs a human click.
        </p>

        <div className="mt-4 space-y-2">
          {stockNeeds.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] px-4 py-8 text-center">
              <Disc3 className="mx-auto h-6 w-6 text-[var(--color-ink-faint)]" />
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                No outstanding stock needs. Blocked offers get flagged from the record popup.
              </p>
            </div>
          )}

          {stockNeeds.map((need) => {
            const stock = availability.find((a) => a.size === need.size);
            return (
              <div
                key={need.size}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-review-border)] bg-[var(--color-review-bg)] px-3.5 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-panel)]">
                  <Disc3 className="h-4 w-4 text-[var(--color-review-ink)]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[var(--color-review-ink)]">
                    {need.size} — {need.unitsNeeded} unit{need.unitsNeeded === 1 ? "" : "s"} needed
                  </p>
                  <p className="text-xs text-[var(--color-review-ink)]">
                    Waiting: {need.recordIds.join(", ")} · flagged {formatShort(new Date(need.flaggedAt).toISOString().slice(0, 10))}
                  </p>
                </div>
                {stock && !stock.confirmed && (
                  <button
                    onClick={() => applyStockConfirmed(stock.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-ready)] px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <PackageCheck className="h-3.5 w-3.5" /> Confirm {stock.id}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section
        className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
          <Boxes className="h-4 w-4 text-[var(--color-accent-ink)]" />
          Stock on record
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                <th className="pb-2">Entry</th>
                <th className="pb-2">Size</th>
                <th className="pb-2">Units</th>
                <th className="pb-2">State</th>
                <th className="pb-2">Waiting</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {availability.map((a) => {
                const need = needBySize.get(a.size);
                const waitingCount = items.filter(
                  (i) =>
                    i.resolution.status === "active" &&
                    i.classification.state === "offer_draft" &&
                    i.wheelSet.size === a.size &&
                    !i.gate.allowed
                ).length;
                return (
                  <tr key={a.id} className="border-t border-[var(--color-border)]">
                    <td className="py-2.5 font-semibold text-[var(--color-ink)]">{a.id}</td>
                    <td className="py-2.5 text-[var(--color-ink-soft)]">{a.size}</td>
                    <td className="py-2.5 text-[var(--color-ink-soft)]">{a.units}</td>
                    <td className="py-2.5">
                      {a.confirmed ? (
                        <Pill tone="ready">Confirmed</Pill>
                      ) : (
                        <Pill tone="review">Unconfirmed</Pill>
                      )}
                    </td>
                    <td className="py-2.5 text-[var(--color-ink-soft)]">
                      {need ? `${need.recordIds.length} flagged` : waitingCount ? `${waitingCount} blocked` : "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      {!a.confirmed && (
                        <button
                          onClick={() => applyStockConfirmed(a.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-ready-border)] px-2.5 py-1.5 text-xs font-bold text-[var(--color-ready-ink)] transition-colors hover:bg-[var(--color-ready-bg)]"
                        >
                          <PackageCheck className="h-3.5 w-3.5" /> Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {blockedByStock.length > 0 && (
        <section
          className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-sm font-bold text-[var(--color-ink)]">Offers blocked right now</h2>
          <div className="mt-3 space-y-2">
            {blockedByStock.map((i) => (
              <button
                key={i.wheelSet.id}
                onClick={() => openRecord(i.wheelSet.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-3 py-2.5 text-left transition-colors hover:border-[var(--color-accent-border)]"
              >
                <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-[var(--color-ink)]">
                  <Disc3 className="h-3.5 w-3.5 shrink-0 text-[var(--color-ink-faint)]" />
                  {i.wheelSet.customer_id}{" "}
                  <span className="text-[var(--color-ink-faint)]">/ {i.wheelSet.id}</span> ·{" "}
                  {i.wheelSet.size}
                </span>
                <Pill tone="review">{formatShort(i.wheelSet.appointmentDate)}</Pill>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
