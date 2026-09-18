"use client";

import { useState } from "react";
import { Check, Send, Store, Wrench } from "lucide-react";
import { useStore } from "@/lib/store";
import { useSession } from "@/lib/session";
import { AXLE_CONDITIONS, KNOWN_SIZES } from "@/lib/seed-data";
import { addDays, todayISO } from "@/lib/dates";
import { ClassificationPill, SourceTag } from "@/components/StatusPill";
import { UrgencyChip } from "@/components/UrgencyChip";

export default function TechnicianPage() {
  const { items, addInspection, openRecord } = useStore();
  const session = useSession();

  const [customerId, setCustomerId] = useState("");
  const [front, setFront] = useState(AXLE_CONDITIONS[0]);
  const [rear, setRear] = useState(AXLE_CONDITIONS[1]);
  const [size, setSize] = useState(KNOWN_SIZES[0]);
  const [sizeUnknown, setSizeUnknown] = useState(false);
  const [date, setDate] = useState(addDays(todayISO(), 4));
  const [contact, setContact] = useState<"available" | "missing">("available");
  const [inShop, setInShop] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  const myRecords = items.filter((i) => i.wheelSet.source === "technician");
  const canSubmit = customerId.trim().length > 0 && !!date;

  function submit() {
    if (!canSubmit) return;
    const id = addInspection({
      customer_id: customerId.trim().toUpperCase(),
      front,
      rear,
      size: sizeUnknown ? "unknown" : size,
      appointmentDate: date,
      contact,
      recordedBy: session?.name ?? "Technician",
      inShop,
    });
    setLastId(id);
    setCustomerId("");
    setFront(AXLE_CONDITIONS[0]);
    setRear(AXLE_CONDITIONS[1]);
    setSizeUnknown(false);
    setContact("available");
    setInShop(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section
          className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
            <Wrench className="h-4 w-4 text-[var(--color-accent-ink)]" />
            Log an inspection
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
            What you saw on the wheels. The coordinator decides whether it becomes an offer — you
            never contact the customer.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Customer ID">
              <input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="CUS-15"
                className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]"
              />
            </Field>

            <Field label="Appointment date">
              <input
                type="date"
                value={date}
                min={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              />
            </Field>

            <Field label="Front axle">
              <Select value={front} onChange={setFront} options={AXLE_CONDITIONS} />
            </Field>

            <Field label="Rear axle">
              <Select value={rear} onChange={setRear} options={AXLE_CONDITIONS} />
            </Field>

            <Field label="Tyre size">
              <Select value={size} onChange={setSize} options={KNOWN_SIZES} disabled={sizeUnknown} />
              <label className="mt-2 flex items-center gap-2 text-xs text-[var(--color-ink-soft)]">
                <input
                  type="checkbox"
                  checked={sizeUnknown}
                  onChange={(e) => setSizeUnknown(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--color-accent)]"
                />
                Measurement missing — I could not size it
              </label>
            </Field>

            <Field label="Can we reach this customer?">
              <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-0.5 text-xs">
                {(["available", "missing"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setContact(v)}
                    className={`rounded-full px-3 py-1.5 font-semibold transition-all ${
                      contact === v
                        ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
                        : "text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-raised)]"
                    }`}
                  >
                    {v === "available" ? "Contact available" : "Contact missing"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <button
            onClick={() => setInShop((v) => !v)}
            className={`mt-4 flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
              inShop
                ? "border-[var(--color-danger-border)] bg-[var(--color-danger-bg)]"
                : "border-[var(--color-border-strong)] hover:border-[var(--color-accent-border)]"
            }`}
          >
            <Store
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                inShop ? "text-[var(--color-danger-ink)]" : "text-[var(--color-ink-faint)]"
              }`}
            />
            <span className="min-w-0">
              <span
                className={`block text-sm font-bold ${
                  inShop ? "text-[var(--color-danger-ink)]" : "text-[var(--color-ink)]"
                }`}
              >
                Customer is in the shop right now
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-[var(--color-ink-soft)]">
                Sends an urgent alert so the coordinator can catch them before they leave.
              </span>
            </span>
            <span
              className={`ml-auto mt-0.5 h-4 w-4 shrink-0 rounded-full border-[5px] ${
                inShop ? "border-[var(--color-danger)]" : "border-[var(--color-border-strong)]"
              }`}
            />
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-[var(--color-accent-contrast)] transition-all hover:bg-[var(--color-accent-strong)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Send to coordinator
            </button>
            <p className="text-xs text-[var(--color-ink-soft)]">
              It classifies itself the moment it lands.
            </p>
          </div>

          {lastId && (
            <button
              onClick={() => openRecord(lastId)}
              className="animate-slide-down mt-4 flex w-full items-center gap-2 rounded-xl border border-[var(--color-ready-border)] bg-[var(--color-ready-bg)] px-3 py-2.5 text-left text-sm font-semibold text-[var(--color-ready-ink)]"
            >
              <Check className="h-4 w-4" /> {lastId} logged — open what the coordinator now sees
            </button>
          )}
        </section>

        <section
          className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-sm font-bold text-[var(--color-ink)]">This session&apos;s entries</h2>
          <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">
            Kept separate from the supplied <code>initial.json</code> records.
          </p>

          <div className="mt-4 space-y-2">
            {myRecords.length === 0 && (
              <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] px-3 py-8 text-center">
                <Wrench className="mx-auto h-5 w-5 text-[var(--color-ink-faint)]" />
                <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Nothing logged yet.</p>
              </div>
            )}
            {myRecords.map((item) => (
              <button
                key={item.wheelSet.id}
                onClick={() => openRecord(item.wheelSet.id)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-3 py-2.5 text-left transition-colors hover:border-[var(--color-accent-border)]"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-bold text-[var(--color-ink)]">
                      {item.wheelSet.customer_id}
                    </span>
                    <SourceTag source={item.wheelSet.source} />
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--color-ink-soft)]">
                    {item.wheelSet.id} · {item.wheelSet.size}
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <ClassificationPill state={item.classification.state} />
                  <UrgencyChip date={item.wheelSet.appointmentDate} />
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)] disabled:opacity-40"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
