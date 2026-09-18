import { formatShort, relativeLabel } from "@/lib/dates";
import type { Availability, WheelSet } from "@/lib/types";

function Cell({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
        {label}
      </dt>
      <dd
        className={`mt-0.5 truncate text-sm ${
          emphasize ? "font-semibold text-[var(--color-ink)]" : "text-[var(--color-ink-soft)]"
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}

export function EvidenceBlock({
  wheelSet,
  matchedStock,
}: {
  wheelSet: WheelSet;
  matchedStock: Availability | null;
}) {
  const stockLabel = !matchedStock
    ? "No matching record"
    : matchedStock.confirmed
      ? `Confirmed · ${matchedStock.units} units`
      : `Unconfirmed · ${matchedStock.units} units`;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
        Evidence — recorded by technician during inspection
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
        <Cell label="Customer" value={wheelSet.customer_id} emphasize />
        <Cell label="Size" value={wheelSet.size} emphasize={wheelSet.size !== "unknown"} />
        <Cell label="Front axle" value={wheelSet.front} />
        <Cell label="Rear axle" value={wheelSet.rear} />
        <Cell label="Stock" value={stockLabel} emphasize={!!matchedStock?.confirmed} />
        <Cell
          label="Contact"
          value={wheelSet.contact === "available" ? "Available" : "Missing"}
          emphasize={wheelSet.contact === "available"}
        />
        <Cell
          label="Appointment"
          value={`${formatShort(wheelSet.appointmentDate)} · ${relativeLabel(wheelSet.appointmentDate)}`}
          emphasize
        />
        <Cell
          label="Source"
          value={
            wheelSet.source === "initial.json"
              ? `initial.json (${wheelSet.appointment})`
              : wheelSet.source === "technician"
                ? `Technician${wheelSet.recordedBy ? ` · ${wheelSet.recordedBy}` : ""}`
                : "Simulated demo row"
          }
        />
      </dl>
    </div>
  );
}
