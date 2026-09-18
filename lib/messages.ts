import { formatLong } from "./dates";
import { formatMAD, quoteFor } from "./pricing";
import { fillTemplate, SHOP_NAME } from "./templates";
import type {
  Availability,
  Channel,
  ClassificationResult,
  DraftLanguage,
  StockStatus,
  TemplateMap,
  WheelSet,
} from "./types";

function axlePhrase(flaggedAxles: Array<"front" | "rear">, language: DraftLanguage): string {
  const hasFront = flaggedAxles.includes("front");
  const hasRear = flaggedAxles.includes("rear");
  if (language === "fr") {
    if (hasFront && hasRear) return "à l'avant et à l'arrière";
    if (hasFront) return "à l'avant";
    if (hasRear) return "à l'arrière";
    return "";
  }
  if (language === "en") {
    if (hasFront && hasRear) return "at the front and rear";
    if (hasFront) return "at the front";
    if (hasRear) return "at the rear";
    return "";
  }
  if (hasFront && hasRear) return "فـ العجلة الأمامية و الخلفية";
  if (hasFront) return "فـ العجلة الأمامية";
  if (hasRear) return "فـ العجلة الخلفية";
  return "";
}

/**
 * Stock phrasing. Contacting is only possible when stock is confirmed, so the
 * "unconfirmed" strings exist for preview only — the send action is blocked.
 */
const STOCK_LINE: Record<DraftLanguage, Record<StockStatus, string>> = {
  fr: {
    confirmed_enough: "Le pneu est disponible en stock.",
    confirmed_short: "Nous avons une partie du stock, le reste est à confirmer.",
    unconfirmed: "Stock non confirmé — envoi bloqué.",
    none: "Aucun stock enregistré — envoi bloqué.",
  },
  en: {
    confirmed_enough: "The tyre is in stock.",
    confirmed_short: "We have part of the stock, the rest is to be confirmed.",
    unconfirmed: "Stock unconfirmed — sending blocked.",
    none: "No stock on record — sending blocked.",
  },
  ar: {
    confirmed_enough: "العجلة متوفرة عندنا فالستوك.",
    confirmed_short: "عندنا شي حاجة فالستوك، الباقي خاصو يتأكد.",
    unconfirmed: "الستوك ماشي مؤكد — الإرسال مسدود.",
    none: "ما كاين حتى ستوك مسجل — الإرسال مسدود.",
  },
};

function priceLine(
  language: DraftLanguage,
  size: string,
  units: number,
  discountPct: number
): string {
  const q = quoteFor(size, units, discountPct);
  const unit = formatMAD(q.unit);
  const total = formatMAD(q.total);
  if (discountPct > 0) {
    if (language === "fr")
      return `Tarif posé : ${unit}/pneu — ${q.units} pneu(s) = ${total} après remise de ${discountPct}% (vous économisez ${formatMAD(q.saved)}).`;
    if (language === "en")
      return `Fitted price: ${unit}/tyre — ${q.units} tyre(s) = ${total} with ${discountPct}% off (you save ${formatMAD(q.saved)}).`;
    return `الثمن بالتركيب: ${unit} للعجلة — ${q.units} ديال العجلات = ${total} مع تخفيض ${discountPct}% (كتربح ${formatMAD(q.saved)}).`;
  }
  if (language === "fr") return `Tarif posé : ${unit}/pneu — ${q.units} pneu(s) = ${total}.`;
  if (language === "en") return `Fitted price: ${unit}/tyre — ${q.units} tyre(s) = ${total}.`;
  return `الثمن بالتركيب: ${unit} للعجلة — ${q.units} ديال العجلات = ${total}.`;
}

export interface DraftMessage {
  text: string;
  subject: string | null;
  cautious: boolean;
}

export function generateDraftMessage(options: {
  wheelSet: WheelSet;
  classification: ClassificationResult;
  stockStatus: StockStatus;
  language: DraftLanguage;
  channel: Channel;
  templates: TemplateMap;
  discountPct: number;
}): DraftMessage {
  const { wheelSet, classification, stockStatus, language, channel, templates, discountPct } = options;
  const units = Math.max(1, classification.flaggedAxles.length);

  const tokens: Record<string, string> = {
    customer: wheelSet.customer_id,
    axles: axlePhrase(classification.flaggedAxles, language),
    size: wheelSet.size,
    date: formatLong(wheelSet.appointmentDate, language),
    stock: STOCK_LINE[language][stockStatus],
    price: priceLine(language, wheelSet.size, units, discountPct),
    shop: SHOP_NAME[language],
  };

  const template = templates[channel][language];
  return {
    text: fillTemplate(template.body, tokens),
    subject: template.subject ? fillTemplate(template.subject, tokens) : null,
    cautious: stockStatus !== "confirmed_enough",
  };
}

/** Availability-aware helper kept for the stock table and analytics. */
export function matchStock(size: string, availability: Availability[]): Availability | null {
  return availability.find((a) => a.size === size) ?? null;
}
