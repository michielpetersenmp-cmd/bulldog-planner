"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Check } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Notificatie = {
  id: string;
  titel: string;
  bericht: string | null;
  type: string;
  gelezen: boolean;
  link: string | null;
  created_at: string;
};

const typeIcoon: Record<string, string> = {
  blog: "📝",
  evenement: "🎪",
  agenda: "📅",
  systeem: "⚙️",
  algemeen: "🔔",
};

export default function NotificatiesPage() {
  const [notificaties, setNotificaties] = useState<Notificatie[]>([]);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    laadNotificaties();
    checkPushStatus();
  }, []);

  async function laadNotificaties() {
    const supabase = createClient();
    const { data } = await supabase
      .from("notificatie_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setNotificaties(data || []);
    setLoading(false);
  }

  async function checkPushStatus() {
    if ("Notification" in window) {
      setPushEnabled(Notification.permission === "granted");
    }
  }

  async function enablePush() {
    if (!("Notification" in window)) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    const supabase = createClient();
    const subJson = subscription.toJSON();
    await supabase.from("push_subscriptions").upsert({
      endpoint: subJson.endpoint,
      p256dh: subJson.keys?.p256dh,
      auth: subJson.keys?.auth,
      user_agent: navigator.userAgent,
    });

    setPushEnabled(true);
  }

  async function markeerGelezen(id: string) {
    const supabase = createClient();
    await supabase.from("notificatie_log").update({ gelezen: true }).eq("id", id);
    setNotificaties((prev) =>
      prev.map((n) => (n.id === id ? { ...n, gelezen: true } : n))
    );
  }

  async function markeerAllesGelezen() {
    const supabase = createClient();
    await supabase.from("notificatie_log").update({ gelezen: true }).eq("gelezen", false);
    setNotificaties((prev) => prev.map((n) => ({ ...n, gelezen: true })));
  }

  const ongelezen = notificaties.filter((n) => !n.gelezen).length;

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-primary px-4 pt-12 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-white mb-1">Meldingen</h1>
            {ongelezen > 0 && (
              <p className="text-white/60 text-sm">{ongelezen} ongelezen</p>
            )}
          </div>
          {ongelezen > 0 && (
            <button
              onClick={markeerAllesGelezen}
              className="text-white/70 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <Check size={14} /> Alles gelezen
            </button>
          )}
        </div>
      </header>

      {/* Push notificaties banner */}
      {!pushEnabled && (
        <div className="mx-4 mt-4 bg-accent/15 border border-accent/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Bell size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-primary text-sm">Meldingen inschakelen</p>
              <p className="text-gray-600 text-xs mt-0.5">
                Ontvang meldingen bij nieuwe blogs en evenementen.
              </p>
            </div>
            <button onClick={enablePush} className="btn-primary text-xs px-3 py-2 shrink-0">
              Aan
            </button>
          </div>
        </div>
      )}

      {pushEnabled && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
          <Bell size={16} className="text-green-600" />
          <span className="text-green-700 text-sm font-medium">Meldingen zijn ingeschakeld</span>
        </div>
      )}

      {/* Notificaties lijst */}
      <div className="px-4 py-4 space-y-2">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Laden...</div>
        ) : notificaties.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔔</div>
            <p className="text-gray-400 font-medium">Geen meldingen</p>
            <p className="text-gray-400 text-sm mt-1">Je bent helemaal bij!</p>
          </div>
        ) : (
          notificaties.map((notif) => (
            <button
              key={notif.id}
              onClick={() => markeerGelezen(notif.id)}
              className={`w-full card text-left transition-all ${
                !notif.gelezen ? "border-l-4 border-accent" : "opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{typeIcoon[notif.type] || "🔔"}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${!notif.gelezen ? "text-primary" : "text-gray-600"}`}>
                    {notif.titel}
                  </p>
                  {notif.bericht && (
                    <p className="text-xs text-gray-500 mt-0.5">{notif.bericht}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                {!notif.gelezen && (
                  <div className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1" />
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
