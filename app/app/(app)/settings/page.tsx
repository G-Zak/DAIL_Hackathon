"use client";

import { useState } from "react";
import { Play, RotateCcw, TriangleAlert, Volume2, VolumeX } from "lucide-react";
import { playNotificationSound } from "@/lib/sound";
import { useStore } from "@/lib/store";
import { CHANNEL_LABEL, LANGUAGE_LABEL, TEMPLATE_TOKENS } from "@/lib/templates";
import { DISCOUNT_OPTIONS, DEMO_PRICE_PER_TYRE_MAD, formatMAD } from "@/lib/pricing";
import type { Channel, DraftLanguage } from "@/lib/types";

const WINDOWS = [7, 14, 30, 90];

export default function SettingsPage() {
  const { settings, updateSettings, updateTemplate, resetTemplate, reset } = useStore();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [language, setLanguage] = useState<DraftLanguage>(settings.defaultLanguage);

  const template = settings.templates[channel][language];

  return (
    <div className="space-y-4">
      <Card title="Language & channel" subtitle="Defaults applied to every draft — not a per-customer field.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default draft language">
            <Segments
              value={settings.defaultLanguage}
              onChange={(v) => updateSettings({ defaultLanguage: v })}
              options={(Object.keys(LANGUAGE_LABEL) as DraftLanguage[]).map((v) => ({
                value: v,
                label: LANGUAGE_LABEL[v],
              }))}
            />
          </Field>
          <Field label="Default channel">
            <Segments
              value={settings.defaultChannel}
              onChange={(v) => updateSettings({ defaultChannel: v })}
              options={(Object.keys(CHANNEL_LABEL) as Channel[]).map((v) => ({
                value: v,
                label: CHANNEL_LABEL[v],
              }))}
            />
          </Field>
        </div>
      </Card>

      <Card
        title="Outreach window"
        subtitle="When stock lands, only customers whose appointment falls inside this window are raised for outreach."
      >
        <Segments
          value={settings.outreachWindowDays}
          onChange={(v) => updateSettings({ outreachWindowDays: v })}
          options={WINDOWS.map((d) => ({ value: d, label: `${d} days` }))}
        />
        <p className="mt-2.5 rounded-lg border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-2.5 py-2 text-[11px] leading-snug text-[var(--color-illustrative-ink)]">
          <strong>Why a window and not &ldquo;visited in the last X months&rdquo;:</strong>{" "}
          <code>initial.json</code> has no visit history — only the next appointment. Inventing a
          &ldquo;last visited&rdquo; field would be fabricating customer data, so the window is
          measured against the appointment date instead. The right months value is a client
          discovery question: does their CRM even track visits, and what is their maintenance cycle?
        </p>
      </Card>

      <Card title="Pricing & discount" subtitle="Demo price list — initial.json carries no pricing.">
        <Field label="Default discount offered">
          <Segments
            value={settings.discountPct}
            onChange={(v) => updateSettings({ discountPct: v })}
            options={DISCOUNT_OPTIONS.map((d) => ({ value: d, label: `${d}%` }))}
          />
        </Field>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(DEMO_PRICE_PER_TYRE_MAD).map(([size, price]) => (
            <div
              key={size}
              className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-3 py-2"
            >
              <span className="text-sm text-[var(--color-ink-soft)]">{size}</span>
              <span className="text-sm font-bold text-[var(--color-ink)]">{formatMAD(price)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Message templates"
        subtitle="Every draft is generated from these. Edit freely — each one resets to its default."
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Segments
            value={channel}
            onChange={setChannel}
            options={(Object.keys(CHANNEL_LABEL) as Channel[]).map((v) => ({
              value: v,
              label: CHANNEL_LABEL[v],
            }))}
          />
          <Segments
            value={language}
            onChange={setLanguage}
            options={(Object.keys(LANGUAGE_LABEL) as DraftLanguage[]).map((v) => ({
              value: v,
              label: LANGUAGE_LABEL[v],
            }))}
          />
          <button
            onClick={() => resetTemplate(channel, language)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to default
          </button>
        </div>

        {template.subject !== undefined && (
          <label className="mb-3 block">
            <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
              Subject
            </span>
            <input
              value={template.subject}
              onChange={(e) => updateTemplate(channel, language, { subject: e.target.value })}
              dir={language === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Body
          </span>
          <textarea
            value={template.body}
            onChange={(e) => updateTemplate(channel, language, { body: e.target.value })}
            dir={language === "ar" ? "rtl" : "ltr"}
            rows={channel === "email" || channel === "call" ? 10 : 5}
            className="w-full resize-none rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-3 text-sm leading-relaxed text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
          />
        </label>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
            Tokens
          </span>
          {TEMPLATE_TOKENS.map((t) => (
            <code
              key={t}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-1.5 py-0.5 text-[11px] text-[var(--color-ink-soft)]"
            >
              {`{{${t}}}`}
            </code>
          ))}
        </div>
      </Card>

      <Card
        title="Notification sound"
        subtitle="A chime when something lands in the notification centre — an urgent in-shop flag rings differently."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Segments
            value={settings.soundEnabled ? "on" : "off"}
            onChange={(v) => updateSettings({ soundEnabled: v === "on" })}
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Muted" },
            ]}
          />
          <button
            onClick={() => playNotificationSound(false)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
          >
            <Play className="h-3.5 w-3.5" /> Test
          </button>
          <button
            onClick={() => playNotificationSound(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-danger-border)] px-3 py-1.5 text-xs font-bold text-[var(--color-danger-ink)] transition-colors hover:bg-[var(--color-danger-bg)]"
          >
            <Play className="h-3.5 w-3.5" /> Test urgent
          </button>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
            {settings.soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {settings.soundEnabled ? "Sound on" : "Muted"}
          </span>
        </div>
        <p className="mt-2.5 text-[11px] leading-snug text-[var(--color-ink-faint)]">
          Browsers only allow audio after you have interacted with the page, so the first chime
          plays once you have clicked something — which, in this flow, you always have.
        </p>
      </Card>

      <Card
        title="Demo data"
        subtitle="Restores every record, stock entry, flag and notification to the initial.json starting point."
      >
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] px-3.5 py-2 text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
        >
          <TriangleAlert className="h-4 w-4 text-[var(--color-review-ink)]" />
          Reset to initial.json
        </button>
      </Card>

      <p className="text-center text-[11px] text-[var(--color-ink-faint)]">
        Settings live in memory for this session — they reset with the demo. Supabase will persist
        them later.
      </p>
    </div>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      className="animate-fade-up rounded-2xl bg-[var(--color-panel)] p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h2 className="text-sm font-bold text-[var(--color-ink)]">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function Segments<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`rounded-full px-2.5 py-1 font-semibold transition-all ${
            value === opt.value
              ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
              : "text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-raised)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
