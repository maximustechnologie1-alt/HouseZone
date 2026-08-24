// Empêche que l'espace « Avis de recherche » (réservé aux clients) ne
// devienne un espace publicitaire déguisé pour des Hôtes — section 24 du CDC.
// Heuristique simple : une annonce de bien disponible parle de CE bien au
// présent/à l'impératif ("disponible", "à louer", "visitez"), alors qu'un
// avis de recherche parle d'un besoin ("je recherche", "budget max").

const LISTING_LIKE_PATTERNS = [
  /\bdisponible\s*(dès|des)?\s*(maintenant|aujourd'?hui)?\b/i,
  /\b(à|a)\s*(louer|vendre)\b/i,
  /\bvisitez\b/i,
  /\bcontactez[ -]?(moi|nous)\b/i,
  /\bpremier\s*arriv[ée]\b/i,
  /\bprix\s*n[ée]gociable\b/i,
  /\boffre\s*(spéciale|exceptionnelle)\b/i,
];

export interface SearchAlertFilterResult {
  flagged: boolean;
  reason?: string;
}

export function checkSearchAlertContent(text: string): SearchAlertFilterResult {
  const hit = LISTING_LIKE_PATTERNS.find((pattern) => pattern.test(text));
  if (hit) {
    return {
      flagged: true,
      reason:
        "Ce texte ressemble à une annonce de bien disponible plutôt qu'à une recherche. Les avis de recherche sont réservés aux clients qui cherchent un bien.",
    };
  }
  return { flagged: false };
}
