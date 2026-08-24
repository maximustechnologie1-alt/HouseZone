// Analyse OCR d'une image d'annonce — section 29 du CDC : détecte les
// coordonnées (téléphone, email, réseaux sociaux, URL) incrustées dans une
// photo pour contourner la messagerie.
//
// V1 : Tesseract.js (gratuit, sans clé API, tourne côté serveur Node).
// L'appel est isolé dans cette fonction pour pouvoir être remplacé par un
// fournisseur cloud (Google Vision, AWS Textract...) sans toucher au reste
// de l'app.

import { checkMessageContent } from "@/lib/messaging/contact-filter";

export interface OcrAnalysisResult {
  status: "valide" | "refuse";
  extractedText: string;
  flaggedReason?: string;
}

export async function analyzeListingImage(imageBuffer: Buffer): Promise<OcrAnalysisResult> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("fra");
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);
    await worker.terminate();

    const trimmed = text.trim();
    if (!trimmed) {
      return { status: "valide", extractedText: "" };
    }

    const { blocked, reason } = checkMessageContent(trimmed);
    if (blocked) {
      return { status: "refuse", extractedText: trimmed, flaggedReason: reason };
    }
    return { status: "valide", extractedText: trimmed };
  } catch (error) {
    // OCR indisponible (environnement sans binaire, image illisible...) :
    // on n'empêche pas la publication, l'image reste soumise au contrôle
    // manuel de la modération.
    console.error("OCR analysis failed", error);
    return { status: "valide", extractedText: "" };
  }
}
