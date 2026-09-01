import { createClient } from "@/lib/supabase/server";

// Section 26 du cahier des charges : un Hôte sans abonnement actif (essai
// expiré, pas de renouvellement) voit ses fonctionnalités professionnelles
// limitées. Utilisé pour gater l'envoi de messages (lecture toujours
// autorisée) et tout autre accès pro nécessitant un abonnement en cours.
export async function hasActiveHostSubscription(hostId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("host_id", hostId)
    .in("status", ["essai", "actif"])
    .maybeSingle();
  return Boolean(data);
}
