"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cloneSeedData } from "./seed-data";
import { classifyWheelSet } from "./classify";
import { generateDraftMessage } from "./messages";
import { cloneTemplates, DEFAULT_TEMPLATES } from "./templates";
import { contactGate, unitsNeeded } from "./gating";
import { urgencyScore } from "./priority";
import { daysUntil, todayISO } from "./dates";
import { quoteFor } from "./pricing";
import { playNotificationSound } from "./sound";
import type {
  AppNotification,
  Availability,
  Channel,
  DraftLanguage,
  MessageTemplate,
  NotificationKind,
  QueueItem,
  RejectionInfo,
  RejectionReasonCode,
  Resolution,
  Settings,
  StockNeed,
  WheelSet,
} from "./types";

export const REJECTION_REASONS: Array<{ code: RejectionReasonCode; label: string }> = [
  { code: "stock_unconfirmed", label: "Stock unconfirmed — too risky" },
  { code: "customer_declined", label: "Customer declined" },
  { code: "wrong_record", label: "Wrong record / inspection error" },
  { code: "other", label: "Other" },
];

export interface InspectionDraft {
  customer_id: string;
  front: string;
  rear: string;
  size: string;
  appointmentDate: string;
  contact: "available" | "missing";
  recordedBy: string;
  inShop: boolean;
}

interface Toast {
  id: number;
  text: string;
  tone: "success" | "info" | "danger";
}

/** Rejected records that stock confirmation has unblocked (Feature 8). */
export interface StockReminder {
  id: string;
  size: string;
  recordIds: string[];
  createdAt: number;
}

const DEFAULT_SETTINGS: Settings = {
  defaultLanguage: "fr",
  defaultChannel: "whatsapp",
  outreachWindowDays: 14,
  discountPct: 10,
  soundEnabled: true,
  templates: cloneTemplates(),
};

function freshResolution(): Resolution {
  return {
    status: "active",
    sentMessage: null,
    sentSubject: null,
    sentLanguage: null,
    sentChannel: null,
    resolvedVia: null,
    resolvedAt: null,
    rejection: null,
    resurrectedCount: 0,
  };
}

function initialResolutions(wheelSets: WheelSet[]): Record<string, Resolution> {
  const map: Record<string, Resolution> = {};
  for (const ws of wheelSets) map[ws.id] = freshResolution();
  return map;
}

export const EXIT_MS = 420;

interface Store {
  wheelSets: WheelSet[];
  availability: Availability[];
  items: QueueItem[];
  actionNeeded: QueueItem[];
  resolvedItems: QueueItem[];
  rejectedItems: QueueItem[];
  noActionItems: QueueItem[];
  sendReady: QueueItem[];
  blockedByStock: QueueItem[];
  bulkEligible: QueueItem[];
  stockNeeds: StockNeed[];
  reminders: StockReminder[];
  notifications: AppNotification[];
  unreadCount: number;

  settings: Settings;
  updateSettings: (patch: Partial<Omit<Settings, "templates">>) => void;
  updateTemplate: (channel: Channel, language: DraftLanguage, patch: Partial<MessageTemplate>) => void;
  resetTemplate: (channel: Channel, language: DraftLanguage) => void;

  language: DraftLanguage;
  setLanguage: (l: DraftLanguage) => void;
  channel: Channel;
  setChannel: (c: Channel) => void;
  discountPct: number;
  setDiscountPct: (n: number) => void;

  editedTexts: Record<string, string>;
  setEditedText: (id: string, text: string) => void;
  editedSubjects: Record<string, string>;
  setEditedSubject: (id: string, text: string) => void;

  openRecordId: string | null;
  openRecord: (id: string) => void;
  closeRecord: () => void;
  highlightId: string | null;
  exiting: { id: string; to: "approved" | "rejected" } | null;

  draftFor: (item: QueueItem) => { text: string; subject: string | null; cautious: boolean };
  approve: (id: string, via?: "single" | "bulk") => void;
  reject: (id: string, reason: RejectionReasonCode) => void;
  resurrect: (id: string) => void;
  bulkApprove: () => void;
  flagStockNeed: (id: string) => void;

  applySizeKnown: () => void;
  applyStockConfirmed: (stockId: string) => void;
  applyAppointmentMoved: (id: string, date: string) => void;
  addInspection: (draft: InspectionDraft) => string;
  dismissReminder: (id: string) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  reset: () => void;

  toast: Toast | null;
}

const StoreContext = createContext<Store | null>(null);

export function useStore(): Store {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore must be used inside <StoreProvider>");
  return value;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wheelSets, setWheelSets] = useState<WheelSet[]>(() => cloneSeedData().wheel_sets);
  const [availability, setAvailability] = useState<Availability[]>(() => cloneSeedData().availability);
  const [resolutions, setResolutions] = useState<Record<string, Resolution>>(() =>
    initialResolutions(cloneSeedData().wheel_sets)
  );
  const [stockNeeds, setStockNeeds] = useState<StockNeed[]>([]);
  const [reminders, setReminders] = useState<StockReminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});
  const [editedSubjects, setEditedSubjects] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<DraftLanguage>(DEFAULT_SETTINGS.defaultLanguage);
  const [channel, setChannel] = useState<Channel>(DEFAULT_SETTINGS.defaultChannel);
  const [discountPct, setDiscountPct] = useState(DEFAULT_SETTINGS.discountPct);
  const [openRecordId, setOpenRecordId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [exiting, setExiting] = useState<{ id: string; to: "approved" | "rejected" } | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const items: QueueItem[] = useMemo(
    () =>
      wheelSets.map((wheelSet) => {
        const classification = classifyWheelSet(wheelSet, availability);
        const gate = contactGate(wheelSet, classification, settings.outreachWindowDays);
        return {
          wheelSet,
          classification,
          resolution: resolutions[wheelSet.id] ?? freshResolution(),
          gate,
          priority: urgencyScore(wheelSet, classification, gate),
        };
      }),
    [wheelSets, availability, resolutions, settings.outreachWindowDays]
  );

  const active = useMemo(() => items.filter((i) => i.resolution.status === "active"), [items]);

  const actionNeeded = useMemo(
    () =>
      active
        .filter((i) => i.classification.state !== "no_action")
        .slice()
        .sort((a, b) => a.priority - b.priority),
    [active]
  );
  const noActionItems = useMemo(
    () => active.filter((i) => i.classification.state === "no_action"),
    [active]
  );
  const resolvedItems = useMemo(() => items.filter((i) => i.resolution.status === "approved"), [items]);
  const rejectedItems = useMemo(() => items.filter((i) => i.resolution.status === "rejected"), [items]);
  const sendReady = useMemo(() => actionNeeded.filter((i) => i.gate.allowed), [actionNeeded]);
  const blockedByStock = useMemo(
    () =>
      actionNeeded.filter(
        (i) =>
          i.classification.state === "offer_draft" &&
          (i.gate.stockStatus === "unconfirmed" || i.gate.stockStatus === "none")
      ),
    [actionNeeded]
  );
  const bulkEligible = useMemo(
    () => sendReady.filter((i) => i.gate.stockStatus === "confirmed_enough"),
    [sendReady]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const showToast = useCallback((text: string, tone: Toast["tone"] = "info") => {
    const id = Date.now();
    setToast({ id, text, tone });
    window.setTimeout(() => setToast((cur) => (cur?.id === id ? null : cur)), 4000);
  }, []);

  const notify = useCallback(
    (n: { kind: NotificationKind; title: string; body: string; recordId?: string; urgent?: boolean }) => {
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: n.kind,
          title: n.title,
          body: n.body,
          recordId: n.recordId ?? null,
          createdAt: Date.now(),
          read: false,
          urgent: n.urgent ?? false,
        },
        ...prev,
      ]);
      if (settings.soundEnabled) playNotificationSound(n.urgent ?? false);
    },
    [settings.soundEnabled]
  );

  const highlight = useCallback((id: string) => {
    setHighlightId(id);
    window.setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 2000);
  }, []);

  const draftFor = useCallback(
    (item: QueueItem) =>
      generateDraftMessage({
        wheelSet: item.wheelSet,
        classification: item.classification,
        stockStatus: item.gate.stockStatus,
        language,
        channel,
        templates: settings.templates,
        discountPct,
      }),
    [language, channel, settings.templates, discountPct]
  );

  const commitResolution = useCallback(
    (id: string, status: "approved" | "rejected", via: "single" | "bulk", rejection: RejectionInfo | null) => {
      const item = items.find((i) => i.wheelSet.id === id);
      if (!item) return;
      const live = draftFor(item);
      const finalText = editedTexts[id] || live.text;
      const finalSubject = channel === "email" ? editedSubjects[id] || live.subject : null;
      setResolutions((prev) => ({
        ...prev,
        [id]: {
          ...(prev[id] ?? freshResolution()),
          status,
          sentMessage: finalText,
          sentSubject: finalSubject,
          sentLanguage: language,
          sentChannel: channel,
          resolvedVia: via,
          resolvedAt: Date.now(),
          rejection,
        },
      }));
    },
    [items, draftFor, editedTexts, editedSubjects, channel, language]
  );

  /** Approve/reject animate out of "Action needed" first, then commit. */
  const animateOut = useCallback(
    (id: string, to: "approved" | "rejected", commit: () => void) => {
      setOpenRecordId(null);
      setExiting({ id, to });
      window.setTimeout(() => {
        commit();
        setExiting((cur) => (cur?.id === id ? null : cur));
      }, EXIT_MS);
    },
    []
  );

  const approve = useCallback(
    (id: string, via: "single" | "bulk" = "single") => {
      const item = items.find((i) => i.wheelSet.id === id);
      if (!item) return;
      if (!item.gate.allowed) {
        showToast(item.gate.reason ?? "Contacting is blocked for this record.", "danger");
        return;
      }
      if (via === "bulk") {
        commitResolution(id, "approved", "bulk", null);
        return;
      }
      animateOut(id, "approved", () => {
        commitResolution(id, "approved", "single", null);
        showToast(`${id} approved — message simulated, not actually delivered`, "success");
      });
    },
    [items, commitResolution, animateOut, showToast]
  );

  const reject = useCallback(
    (id: string, reasonCode: RejectionReasonCode) => {
      const item = items.find((i) => i.wheelSet.id === id);
      const def = REJECTION_REASONS.find((r) => r.code === reasonCode) ?? REJECTION_REASONS[3];
      const rejection: RejectionInfo = {
        code: def.code,
        label: def.label,
        stockSize: def.code === "stock_unconfirmed" ? item?.wheelSet.size ?? null : null,
        rejectedAt: Date.now(),
      };
      animateOut(id, "rejected", () => {
        commitResolution(id, "rejected", "single", rejection);
        showToast(`${id} rejected — "${def.label}". Kept in the Rejected bin.`, "danger");
      });
    },
    [items, commitResolution, animateOut, showToast]
  );

  const bulkApprove = useCallback(() => {
    const ids = bulkEligible.map((i) => i.wheelSet.id);
    if (ids.length === 0) return;
    for (const id of ids) approve(id, "bulk");
    showToast(
      `Bulk-approved ${ids.length} draft${ids.length === 1 ? "" : "s"} (${ids.join(", ")}) — simulated, nothing delivered`,
      "success"
    );
  }, [bulkEligible, approve, showToast]);

  const resurrect = useCallback(
    (id: string) => {
      setResolutions((prev) => {
        const current = prev[id] ?? freshResolution();
        return { ...prev, [id]: { ...freshResolution(), resurrectedCount: current.resurrectedCount + 1 } };
      });
      setReminders((prev) =>
        prev
          .map((r) => ({ ...r, recordIds: r.recordIds.filter((rid) => rid !== id) }))
          .filter((r) => r.recordIds.length > 0)
      );
      setEditedTexts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      highlight(id);
      showToast(`${id} moved back to the queue as a fresh Offer Draft`, "success");
    },
    [highlight, showToast]
  );

  /** Tell whoever manages stock that a size is holding an offer up. */
  const flagStockNeed = useCallback(
    (id: string) => {
      const item = items.find((i) => i.wheelSet.id === id);
      if (!item) return;
      const size = item.wheelSet.size;
      const need = unitsNeeded(item.classification);
      setStockNeeds((prev) => {
        const existing = prev.find((s) => s.size === size);
        if (existing) {
          if (existing.recordIds.includes(id)) return prev;
          return prev.map((s) =>
            s.size === size
              ? { ...s, recordIds: [...s.recordIds, id], unitsNeeded: s.unitsNeeded + need }
              : s
          );
        }
        return [...prev, { size, recordIds: [id], unitsNeeded: need, flaggedAt: Date.now() }];
      });
      showToast(`${size} flagged to stock — ${item.wheelSet.customer_id} is waiting on it`, "info");
    },
    [items, showToast]
  );

  const applySizeKnown = useCallback(() => {
    setWheelSets((prev) =>
      prev.map((ws) =>
        ws.id === "TY-2" ? { ...ws, size: "205/55 R16", front: "review replacement" } : ws
      )
    );
    showToast("TY-2 measurement recorded — re-classified", "info");
  }, [showToast]);

  const applyStockConfirmed = useCallback(
    (stockId: string) => {
      const stock = availability.find((a) => a.id === stockId);
      if (!stock) return;
      setAvailability((prev) => prev.map((a) => (a.id === stockId ? { ...a, confirmed: true } : a)));

      // Stock need for this size is satisfied.
      setStockNeeds((prev) => prev.filter((s) => s.size !== stock.size));

      const inWindow = (ws: WheelSet) => daysUntil(ws.appointmentDate) <= settings.outreachWindowDays;

      // Rejected-on-stock records become eligible to revisit — they never move on
      // their own (Feature 8), and only those inside the outreach window are raised.
      const eligible = items.filter(
        (i) =>
          i.resolution.status === "rejected" &&
          i.resolution.rejection?.code === "stock_unconfirmed" &&
          i.resolution.rejection.stockSize === stock.size &&
          inWindow(i.wheelSet)
      );
      if (eligible.length > 0) {
        setReminders((prev) => [
          ...prev.filter((r) => r.size !== stock.size),
          {
            id: `rem-${stock.size}-${Date.now()}`,
            size: stock.size,
            recordIds: eligible.map((i) => i.wheelSet.id),
            createdAt: Date.now(),
          },
        ]);
      }

      // Blocked-but-still-active records simply become contactable now.
      const unblocked = items.filter(
        (i) =>
          i.resolution.status === "active" &&
          i.classification.state === "offer_draft" &&
          i.wheelSet.size === stock.size &&
          !i.gate.allowed &&
          inWindow(i.wheelSet)
      );

      const names = [...unblocked, ...eligible].map((i) => i.wheelSet.id);
      if (names.length > 0) {
        notify({
          kind: "stock_ready",
          title: `Stock confirmed — ${stock.size}`,
          body: `${names.join(", ")} can now be contacted (appointments inside the ${settings.outreachWindowDays}-day outreach window).`,
          recordId: names[0],
        });
      }
      showToast(`${stockId} confirmed for ${stock.size} — contacting unblocked`, "success");
    },
    [availability, items, settings.outreachWindowDays, notify, showToast]
  );

  const applyAppointmentMoved = useCallback(
    (id: string, date: string) => {
      setWheelSets((prev) => prev.map((ws) => (ws.id === id ? { ...ws, appointmentDate: date } : ws)));
      showToast(`${id} appointment moved — queue re-sorted`, "info");
    },
    [showToast]
  );

  const addInspection = useCallback(
    (draft: InspectionDraft) => {
      const next =
        wheelSets.reduce((max, ws) => {
          const n = parseInt(ws.id.replace(/\D/g, ""), 10);
          return Number.isFinite(n) && n > max ? n : max;
        }, 0) + 1;
      const id = `TY-${next}`;
      const record: WheelSet = {
        id,
        customer_id: draft.customer_id,
        front: draft.front,
        rear: draft.rear,
        size: draft.size,
        appointment: `Entered ${draft.appointmentDate}`,
        appointmentDate: draft.appointmentDate,
        contact: draft.contact,
        source: "technician",
        recordedBy: draft.recordedBy,
        inShop: draft.inShop,
        createdAt: Date.now(),
      };
      setWheelSets((prev) => [...prev, record]);
      setResolutions((prev) => ({ ...prev, [id]: freshResolution() }));
      highlight(id);

      const flagged = record.front === "review replacement" || record.rear === "review replacement";
      if (draft.inShop && flagged) {
        notify({
          kind: "in_shop",
          title: `${draft.customer_id} is in the shop now`,
          body: `${id}: ${draft.size} flagged by ${draft.recordedBy}. Catch them before they leave — offer the change or book it in.`,
          recordId: id,
          urgent: true,
        });
      } else {
        notify({
          kind: "new_inspection",
          title: `New inspection — ${draft.customer_id}`,
          body: `${id} logged by ${draft.recordedBy}.`,
          recordId: id,
        });
      }
      showToast(`Inspection ${id} logged — now in the coordinator queue`, "success");
      return id;
    },
    [wheelSets, highlight, notify, showToast]
  );

  /**
   * Price is embedded in the draft text, so changing the discount has to refresh
   * the drafts — including any the coordinator has hand-edited, which would
   * otherwise keep quoting the old figure.
   */
  const changeDiscount = useCallback(
    (n: number) => {
      setDiscountPct(n);
      setEditedTexts((prev) => {
        if (Object.keys(prev).length > 0) showToast("Drafts refreshed at the new price", "info");
        return {};
      });
      setEditedSubjects({});
    },
    [showToast]
  );

  const updateSettings = useCallback((patch: Partial<Omit<Settings, "templates">>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (patch.defaultLanguage) setLanguage(patch.defaultLanguage);
    if (patch.defaultChannel) setChannel(patch.defaultChannel);
    if (typeof patch.discountPct === "number") changeDiscount(patch.discountPct);
  }, [changeDiscount]);

  const updateTemplate = useCallback(
    (ch: Channel, lang: DraftLanguage, patch: Partial<MessageTemplate>) => {
      setSettings((prev) => ({
        ...prev,
        templates: {
          ...prev.templates,
          [ch]: { ...prev.templates[ch], [lang]: { ...prev.templates[ch][lang], ...patch } },
        },
      }));
    },
    []
  );

  const resetTemplate = useCallback((ch: Channel, lang: DraftLanguage) => {
    setSettings((prev) => ({
      ...prev,
      templates: {
        ...prev.templates,
        [ch]: { ...prev.templates[ch], [lang]: { ...DEFAULT_TEMPLATES[ch][lang] } },
      },
    }));
  }, []);

  const reset = useCallback(() => {
    const fresh = cloneSeedData();
    setWheelSets(fresh.wheel_sets);
    setAvailability(fresh.availability);
    setResolutions(initialResolutions(fresh.wheel_sets));
    setStockNeeds([]);
    setReminders([]);
    setNotifications([]);
    setSettings({ ...DEFAULT_SETTINGS, templates: cloneTemplates() });
    setEditedTexts({});
    setEditedSubjects({});
    setLanguage(DEFAULT_SETTINGS.defaultLanguage);
    setChannel(DEFAULT_SETTINGS.defaultChannel);
    setDiscountPct(DEFAULT_SETTINGS.discountPct);
    setOpenRecordId(null);
    setHighlightId(null);
    setExiting(null);
    showToast("Reset — every record restored to the initial.json starting point", "info");
  }, [showToast]);

  const value: Store = {
    wheelSets,
    availability,
    items,
    actionNeeded,
    resolvedItems,
    rejectedItems,
    noActionItems,
    sendReady,
    blockedByStock,
    bulkEligible,
    stockNeeds,
    reminders,
    notifications,
    unreadCount,

    settings,
    updateSettings,
    updateTemplate,
    resetTemplate,

    language,
    setLanguage,
    channel,
    setChannel,
    discountPct,
    setDiscountPct: changeDiscount,

    editedTexts,
    setEditedText: (id, text) => setEditedTexts((prev) => ({ ...prev, [id]: text })),
    editedSubjects,
    setEditedSubject: (id, text) => setEditedSubjects((prev) => ({ ...prev, [id]: text })),

    openRecordId,
    openRecord: setOpenRecordId,
    closeRecord: () => setOpenRecordId(null),
    highlightId,
    exiting,

    draftFor,
    approve,
    reject,
    resurrect,
    bulkApprove,
    flagStockNeed,

    applySizeKnown,
    applyStockConfirmed,
    applyAppointmentMoved,
    addInspection,
    dismissReminder: (id) => setReminders((prev) => prev.filter((r) => r.id !== id)),
    markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    markRead: (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    reset,

    toast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Projected revenue per appointment date, from contactable offers only. */
export function buildProjection(items: QueueItem[], discountPct: number) {
  const byDate = new Map<string, { units: number; total: number; ids: string[] }>();
  for (const item of items) {
    if (item.resolution.status !== "active") continue;
    if (item.classification.state !== "offer_draft") continue;
    const units = Math.max(1, item.classification.flaggedAxles.length);
    const q = quoteFor(item.wheelSet.size, units, discountPct);
    const key = item.wheelSet.appointmentDate;
    const entry = byDate.get(key) ?? { units: 0, total: 0, ids: [] };
    entry.units += units;
    entry.total += q.total;
    entry.ids.push(item.wheelSet.id);
    byDate.set(key, entry);
  }
  const series = Array.from(byDate.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));
  const cumulative = series.reduce((n, s) => n + s.total, 0);
  return { series, cumulative, today: todayISO() };
}
