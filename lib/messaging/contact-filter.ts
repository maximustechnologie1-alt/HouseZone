// Détection des tentatives de contournement de la messagerie HouseZone
// (téléphones, emails, réseaux sociaux, liens) — RG11 / section 27 du CDC.
//
// Volontairement permissif en faux-positifs plutôt qu'en faux-négatifs : un
// message bloqué à tort peut être reformulé, une coordonnée qui fuite ne
// peut pas être reprise.

const DIGIT_WORDS: Record<string, string> = {
  zero: "0",
  zéro: "0",
  un: "1",
  une: "1",
  deux: "2",
  trois: "3",
  quatre: "4",
  cinq: "5",
  six: "6",
  sept: "7",
  huit: "8",
  neuf: "9",
};

const SOCIAL_KEYWORDS = [
  "whatsapp",
  "wtsap",
  "wtsapp",
  "facebook",
  "fb.com",
  "instagram",
  "insta",
  "tiktok",
  "telegram",
  "tg",
  "snapchat",
  "snap",
  "imo",
];

const URL_PATTERN = /\b((https?:\/\/)?(www\.)?[a-z0-9-]+\.(com|net|org|bf|io|me|ly|co)\b\/?\S*)/i;
const EMAIL_PATTERN = /[a-z0-9._%+-]+\s*(@|\(at\)|\[at\])\s*[a-z0-9.-]+\s*(\.|\(dot\)|\[dot\])\s*[a-z]{2,}/i;

// Burkina Faso: 8 chiffres, parfois précédés de +226 / 00226. On tolère
// espaces, tirets, points entre les chiffres, et les chiffres écrits en
// toutes lettres.
function normalizeDigits(text: string) {
  let normalized = text.toLowerCase();
  for (const [word, digit] of Object.entries(DIGIT_WORDS)) {
    normalized = normalized.replace(new RegExp(`\\b${word}\\b`, "g"), digit);
  }
  return normalized;
}

function containsPhoneNumber(text: string) {
  const normalized = normalizeDigits(text);
  // Strip everything except digits and separators, then look for 8+ digit runs.
  const digitsOnly = normalized.replace(/[^\d\s\-.]/g, " ");
  const compact = digitsOnly.replace(/[\s\-.]/g, "");
  const runs = compact.match(/\d{8,}/g);
  return Boolean(runs?.some((run) => run.length >= 8 && run.length <= 13));
}

export interface ContactFilterResult {
  blocked: boolean;
  reason?: string;
}

export function checkMessageContent(content: string): ContactFilterResult {
  if (containsPhoneNumber(content)) {
    return { blocked: true, reason: "Un numéro de téléphone a été détecté dans ce message." };
  }
  if (EMAIL_PATTERN.test(content)) {
    return { blocked: true, reason: "Une adresse email a été détectée dans ce message." };
  }
  if (URL_PATTERN.test(content)) {
    return { blocked: true, reason: "Un lien externe a été détecté dans ce message." };
  }
  const lower = content.toLowerCase();
  const socialHit = SOCIAL_KEYWORDS.find((keyword) => lower.includes(keyword));
  if (socialHit) {
    return {
      blocked: true,
      reason: `Une référence à un réseau externe (${socialHit}) a été détectée dans ce message.`,
    };
  }
  return { blocked: false };
}
