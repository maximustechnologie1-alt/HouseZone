// Abstraction de fournisseur de paiement — RG15 : un paiement doit être
// confirmé côté serveur avant l'activation d'un abonnement/réservation.
//
// V1 : fournisseur "manuel" — l'utilisateur paie par Mobile Money en dehors
// de l'app puis saisit la référence de transaction ; un administrateur
// vérifie et confirme depuis /admin/paiements. Aucune activation n'a lieu
// tant que le statut n'est pas passé à "reussi" côté serveur.
//
// Pour brancher un agrégateur réel (CinetPay, PayDunya, Orange Money API...)
// plus tard : implémenter `PaymentProvider` et l'exposer par `getPaymentProvider()`.

import type { PaymentMethod } from "@/lib/types/database";

export interface InitiatePaymentInput {
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface InitiatePaymentResult {
  providerReference: string;
  requiresManualConfirmation: boolean;
  instructions?: string;
}

export interface PaymentProvider {
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
}

class ManualPaymentProvider implements PaymentProvider {
  async initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const reference = input.reference?.trim() || `HZ-${Date.now().toString(36).toUpperCase()}`;
    return {
      providerReference: reference,
      requiresManualConfirmation: true,
      instructions:
        input.method === "mobile_money"
          ? "Effectuez le transfert Mobile Money puis saisissez la référence de transaction reçue par SMS. Votre abonnement sera activé dès vérification par notre équipe (généralement sous quelques heures)."
          : "Le paiement par carte sera confirmé manuellement par notre équipe pour cette version.",
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  return new ManualPaymentProvider();
}
