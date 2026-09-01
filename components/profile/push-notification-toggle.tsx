"use client";

import { useState, useTransition } from "react";
import { subscribeToPushAction, unsubscribeFromPushAction } from "@/lib/actions/push";
import { useI18n } from "@/lib/i18n/context";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Section 43 du CDC : l'utilisateur doit pouvoir accepter, refuser, ou
// désactiver ultérieurement les notifications Web Push — indépendant des
// notifications internes (toujours actives, voir lib/notifications/create.ts).
export function PushNotificationToggle({ initialEnabled }: { initialEnabled: boolean }) {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

  async function enable() {
    setError(null);
    if (!VAPID_PUBLIC_KEY) {
      setError("Les notifications push ne sont pas disponibles pour le moment.");
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Autorisation refusée par le navigateur.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = subscription.toJSON();
      startTransition(async () => {
        await subscribeToPushAction({
          endpoint: json.endpoint!,
          keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        });
        setEnabled(true);
      });
    } catch {
      setError("Impossible d'activer les notifications sur cet appareil.");
    }
  }

  async function disable() {
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        startTransition(async () => {
          await unsubscribeFromPushAction(endpoint);
          setEnabled(false);
        });
      } else {
        setEnabled(false);
      }
    } catch {
      setError("Impossible de désactiver les notifications.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-hz-navy">{t("profile.push_notifications")}</p>
        <p className="mt-0.5 text-xs text-hz-ink/50">{t("profile.push_notifications_hint")}</p>
        {!supported && <p className="mt-1 text-xs text-hz-ink/40">{t("profile.push_notifications_unsupported")}</p>}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={!supported || pending}
        onClick={() => (enabled ? disable() : enable())}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
          enabled ? "bg-hz-blue" : "bg-hz-navy/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
