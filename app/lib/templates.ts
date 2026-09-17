import type { Channel, DraftLanguage, TemplateMap } from "./types";

/**
 * Every customer-facing message is template-driven, so the coordinator can rewrite
 * any of them in Settings and still fall back to these defaults. Tokens available:
 *
 *   {{customer}} {{axles}} {{size}} {{date}} {{stock}} {{price}} {{shop}}
 *
 * Language and channel remain a uniform build-time assumption — initial.json has no
 * per-customer language, channel or consent field.
 */
export const TEMPLATE_TOKENS = ["customer", "axles", "size", "date", "stock", "price", "shop"] as const;

export const DEFAULT_TEMPLATES: TemplateMap = {
  whatsapp: {
    fr: {
      body: "🛞 Bonjour, lors du contrôle de vos pneus, notre technicien a identifié un remplacement à prévoir {{axles}} ({{size}}). {{stock}} {{price}} Souhaitez-vous que nous le préparions pour votre rendez-vous du {{date}} ?",
    },
    en: {
      body: "🛞 Hi there, during your tyre inspection our technician found a replacement to plan {{axles}} ({{size}}). {{stock}} {{price}} Shall we get it ready for your appointment on {{date}}?",
    },
    ar: {
      body: "🛞 سلام، خلال فحص العجلات، التقني ديالنا لقا بلي كاين تبديل خاصو يتدار {{axles}} ({{size}}). {{stock}} {{price}} واش نحضروه ليك للموعد ديالك ديال {{date}}؟",
    },
  },
  sms: {
    fr: { body: "Pneu(s) {{axles}} a changer ({{size}}). {{stock}} {{price}} RDV {{date}}. Merci de confirmer." },
    en: { body: "Tyre(s) {{axles}} need replacing ({{size}}). {{stock}} {{price}} Appt {{date}}. Please confirm." },
    ar: { body: "لازم تبديل {{axles}} ({{size}}). {{stock}} {{price}} الموعد {{date}}. أكد ليا عافاك." },
  },
  email: {
    fr: {
      subject: "Pneus — remplacement à prévoir avant votre rendez-vous",
      body: "Bonjour,\nLors du contrôle de vos pneus, notre technicien a identifié un remplacement à prévoir {{axles}} ({{size}}). {{stock}}\n\n{{price}}\n\nMerci de nous confirmer si vous souhaitez que nous préparions ce remplacement avant votre rendez-vous du {{date}}.\n\nCordialement,\n{{shop}}",
    },
    en: {
      subject: "Tyres — replacement needed before your appointment",
      body: "Hello,\nDuring your tyre inspection, our technician identified a replacement to plan {{axles}} ({{size}}). {{stock}}\n\n{{price}}\n\nPlease let us know if you would like us to prepare this ahead of your appointment on {{date}}.\n\nBest regards,\n{{shop}}",
    },
    ar: {
      subject: "العجلات — تبديل خاصو يتدار قبل الموعد",
      body: "سلام،\nخلال فحص العجلات، التقني ديالنا لقا بلي كاين تبديل خاصو يتدار {{axles}} ({{size}}). {{stock}}\n\n{{price}}\n\nعافاك أكد لينا واش بغيتي نحضروه قبل الموعد ديالك ديال {{date}}.\n\nتحياتنا،\n{{shop}}",
    },
  },
  call: {
    fr: {
      body: "Script d'appel — {{customer}}\n\n1. Bonjour, ici {{shop}}.\n2. Lors du contrôle de vos pneus, on a vu qu'un remplacement est à prévoir {{axles}} en {{size}}.\n3. {{stock}} {{price}}\n4. Votre rendez-vous est le {{date}} — on vous le prépare ?\n5. Si oui : confirmer la pose le jour du rendez-vous.",
    },
    en: {
      body: "Call script — {{customer}}\n\n1. Hello, this is {{shop}}.\n2. During your tyre inspection we found a replacement to plan {{axles}} in {{size}}.\n3. {{stock}} {{price}}\n4. Your appointment is on {{date}} — shall we prepare it?\n5. If yes: confirm fitting on the day of the appointment.",
    },
    ar: {
      body: "سكريبت ديال التيليفون — {{customer}}\n\n1. سلام، هذا {{shop}}.\n2. خلال فحص العجلات لقينا بلي خاص تبديل {{axles}} ديال {{size}}.\n3. {{stock}} {{price}}\n4. الموعد ديالك {{date}} — نحضروه ليك؟\n5. إلا وافق: أكد التركيب نهار الموعد.",
    },
  },
};

export const SHOP_NAME: Record<DraftLanguage, string> = {
  fr: "L'équipe atelier",
  en: "The workshop team",
  ar: "فريق الورشة",
};

export function cloneTemplates(): TemplateMap {
  return JSON.parse(JSON.stringify(DEFAULT_TEMPLATES)) as TemplateMap;
}

export function fillTemplate(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => tokens[key] ?? "");
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  call: "Call",
};

export const LANGUAGE_LABEL: Record<DraftLanguage, string> = {
  fr: "Français",
  ar: "Darija",
  en: "English",
};
