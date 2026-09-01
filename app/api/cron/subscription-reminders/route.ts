import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications/create";

// Section 38 du CDC : rappels J-7/J-3/J-1/jour J avant expiration d'un
// abonnement Hôte. Appelé une fois par jour par un cron Vercel (voir
// vercel.json) ; protégé par CRON_SECRET pour ne pas être déclenchable
// publiquement (Vercel Cron envoie automatiquement ce header).
const MILESTONES_DAYS = [7, 3, 1, 0];

function startOfTodayIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: subscriptions } = await admin
    .from("subscriptions")
    .select("id, host_id, end_date")
    .in("status", ["essai", "actif"]);

  let notified = 0;

  for (const sub of subscriptions ?? []) {
    const daysLeft = Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    if (!MILESTONES_DAYS.includes(daysLeft)) continue;

    // Idempotence : un cron relancé le même jour ne doit pas re-notifier.
    const { data: existing } = await admin
      .from("notifications")
      .select("id")
      .eq("user_id", sub.host_id)
      .eq("type", "abonnement_expire_bientot")
      .gte("created_at", startOfTodayIso())
      .maybeSingle();
    if (existing) continue;

    const body =
      daysLeft === 0
        ? "Votre abonnement expire aujourd'hui. Renouvelez-le pour conserver vos fonctionnalités professionnelles."
        : `Votre abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}. Pensez à le renouveler.`;

    await createNotification({
      userId: sub.host_id,
      type: "abonnement_expire_bientot",
      title: "Abonnement bientôt expiré",
      body,
      link: "/espace-hote/abonnement",
    });
    notified += 1;
  }

  return NextResponse.json({ ok: true, notified });
}
