"use client";

import { useState } from "react";
import { Bot, CalendarPlus, Mail, MessageCircle, Pencil, Phone, Smartphone } from "lucide-react";
import { buildCallbackICS, DEMO_PHONE, DEMO_PHONE_DISPLAY, downloadICS } from "@/lib/calendar";
import { CHANNEL_LABEL, LANGUAGE_LABEL } from "@/lib/templates";
import type { Channel, DraftLanguage, WheelSet } from "@/lib/types";

const CHANNEL_ICON: Record<Channel, typeof Mail> = {
  whatsapp: MessageCircle,
  sms: Smartphone,
  email: Mail,
  call: Phone,
};

const SMS_LIMIT = 160;

export function MessageComposer({
  wheelSet,
  text,
  subject,
  language,
  onLanguageChange,
  channel,
  onChannelChange,
  editedText,
  onEditedTextChange,
  editedSubject,
  onEditedSubjectChange,
  readOnly,
}: {
  wheelSet: WheelSet;
  text: string;
  subject: string | null;
  language: DraftLanguage;
  onLanguageChange: (lang: DraftLanguage) => void;
  channel: Channel;
  onChannelChange: (channel: Channel) => void;
  editedText: string;
  onEditedTextChange: (text: string) => void;
  editedSubject: string;
  onEditedSubjectChange: (text: string) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const isRtl = language === "ar";
  const bodyText = editedText || text;
  const subjectText = channel === "email" ? editedSubject || subject || "" : null;
  const canEdit = !readOnly;
  const Icon = CHANNEL_ICON[channel];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-3">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-ink)]">
          <Icon className="h-4 w-4 text-[var(--color-accent-ink)]" />
          {CHANNEL_LABEL[channel]} draft
        </span>
        <span className="rounded-md bg-[var(--color-noaction-bg)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-noaction)]">
          simulated — not sent
        </span>
        {canEdit && (
          <button
            onClick={() => setEditing((v) => !v)}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] px-2.5 py-1 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
          >
            <Pencil className="h-3 w-3" />
            {editing ? "Done" : "Edit"}
          </button>
        )}
      </div>

      {canEdit && (
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <Segments
            value={channel}
            onChange={onChannelChange}
            options={(Object.keys(CHANNEL_LABEL) as Channel[]).map((v) => ({
              value: v,
              label: CHANNEL_LABEL[v],
            }))}
          />
          <Segments
            value={language}
            onChange={onLanguageChange}
            options={(Object.keys(LANGUAGE_LABEL) as DraftLanguage[]).map((v) => ({
              value: v,
              label: LANGUAGE_LABEL[v],
            }))}
          />
        </div>
      )}

      <div dir={isRtl ? "rtl" : "ltr"}>
        {channel === "email" ? (
          <div className="overflow-hidden rounded-xl border border-[var(--color-border-strong)]">
            <div className="border-b border-[var(--color-border)] bg-[var(--color-panel-sunken)] px-3 py-2">
              <span className="mr-2 text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                Subject
              </span>
              {editing ? (
                <input
                  value={subjectText ?? ""}
                  onChange={(e) => onEditedSubjectChange(e.target.value)}
                  dir={isRtl ? "rtl" : "ltr"}
                  className="w-[70%] bg-transparent text-sm font-semibold text-[var(--color-ink)] outline-none"
                />
              ) : (
                <span className="text-sm font-semibold text-[var(--color-ink)]">{subjectText}</span>
              )}
            </div>
            <Body editing={editing} value={bodyText} onChange={onEditedTextChange} isRtl={isRtl} rows={7} plain />
          </div>
        ) : channel === "sms" ? (
          <div>
            <Body
              editing={editing}
              value={bodyText}
              onChange={onEditedTextChange}
              isRtl={isRtl}
              rows={4}
              mono
              background="var(--color-sms-bubble)"
            />
            <p
              className={`mt-1 text-right text-[11px] ${
                bodyText.length > SMS_LIMIT ? "text-[var(--color-danger)]" : "text-[var(--color-ink-faint)]"
              }`}
            >
              {bodyText.length} / {SMS_LIMIT} characters
              {bodyText.length > SMS_LIMIT ? " — over one SMS segment" : ""}
            </p>
          </div>
        ) : channel === "call" ? (
          <CallPanel
            wheelSet={wheelSet}
            script={bodyText}
            editing={editing}
            onChange={onEditedTextChange}
            isRtl={isRtl}
            readOnly={!!readOnly}
          />
        ) : (
          <Body
            editing={editing}
            value={bodyText}
            onChange={onEditedTextChange}
            isRtl={isRtl}
            rows={5}
            bubble
            background="var(--color-whatsapp-bubble)"
          />
        )}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-[var(--color-ink-faint)]">
        Template-driven — edit the defaults for any channel and language in Settings. Language and
        channel are a uniform build-time choice, not per-customer fields in <code>initial.json</code>.
      </p>
    </div>
  );
}

function Body({
  editing,
  value,
  onChange,
  isRtl,
  rows,
  mono,
  bubble,
  plain,
  background,
}: {
  editing: boolean;
  value: string;
  onChange: (v: string) => void;
  isRtl: boolean;
  rows: number;
  mono?: boolean;
  bubble?: boolean;
  plain?: boolean;
  background?: string;
}) {
  const font = mono ? "font-mono " : "";
  if (editing) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={isRtl ? "rtl" : "ltr"}
        rows={rows}
        className={`w-full resize-none ${plain ? "" : bubble ? "rounded-2xl border border-[var(--color-border-strong)]" : "rounded-xl border border-[var(--color-border-strong)]"} ${font}p-3 text-sm leading-relaxed text-[var(--color-ink)] outline-none`}
        style={{ background: background ?? "var(--color-panel)" }}
      />
    );
  }
  if (bubble) {
    return (
      <div className="flex">
        <div
          className="max-w-full whitespace-pre-wrap rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed text-[var(--color-ink)]"
          style={{ background }}
        >
          {value}
        </div>
      </div>
    );
  }
  return (
    <div
      className={`whitespace-pre-wrap ${plain ? "" : "rounded-xl border border-[var(--color-border)]"} ${font}p-3 text-sm leading-relaxed text-[var(--color-ink)]`}
      style={{ background: background ?? "var(--color-panel)" }}
    >
      {value}
    </div>
  );
}

function CallPanel({
  wheelSet,
  script,
  editing,
  onChange,
  isRtl,
  readOnly,
}: {
  wheelSet: WheelSet;
  script: string;
  editing: boolean;
  onChange: (v: string) => void;
  isRtl: boolean;
  readOnly: boolean;
}) {
  function addToCalendar() {
    downloadICS(`tyre-call-${wheelSet.id}.ics`, buildCallbackICS(wheelSet, script));
  }

  return (
    <div className="space-y-2.5">
      <Body editing={editing} value={script} onChange={onChange} isRtl={isRtl} rows={8} />

      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${DEMO_PHONE}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-ready)] px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            <Phone className="h-3.5 w-3.5" />
            Call {DEMO_PHONE_DISPLAY}
          </a>
          <button
            onClick={addToCalendar}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-border-strong)] px-3 py-2 text-xs font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-panel-sunken)]"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
            Add call to calendar (.ics)
          </button>
          <span
            title="Automated voice calling is not implemented in this slice"
            className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-dashed border-[var(--color-border-strong)] px-3 py-2 text-xs font-semibold text-[var(--color-ink-faint)]"
          >
            <Bot className="h-3.5 w-3.5" />
            Voice bot · soon
          </span>
        </div>
      )}

      <p className="rounded-lg border border-[var(--color-illustrative-border)] bg-[var(--color-illustrative-bg)] px-2 py-1.5 text-[11px] leading-snug text-[var(--color-illustrative-ink)]">
        {DEMO_PHONE_DISPLAY} is a placeholder — <code>initial.json</code> stores no phone numbers,
        only whether a customer is reachable. The calendar file is real; the call itself is yours to
        make.
      </p>
    </div>
  );
}

function Segments<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-panel-sunken)] p-0.5 text-xs">
      {options.map((opt) => (
        <button
          key={opt.value}
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
