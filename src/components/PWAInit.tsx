"use client";

import { useEffect, useState } from "react";

export default function PWAInit() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    // Service Worker registreren
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg.scope))
        .catch((err) => console.error("SW error:", err));
    }

    // PWA install prompt opvangen
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Toon install banner na 30 seconden
      setTimeout(() => setShowInstall(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowInstall(false);
      setInstallPrompt(null);
    }
  }

  if (!showInstall || !installPrompt) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 slide-up">
      <div className="bg-primary text-white rounded-2xl p-4 shadow-hover flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 text-2xl">
          🐾
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Installeer de app</p>
          <p className="text-white/70 text-xs">Voeg toe aan je beginscherm</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstall(false)}
            className="text-white/60 hover:text-white text-xs px-2 py-1"
          >
            Nee
          </button>
          <button
            onClick={installApp}
            className="bg-accent text-primary font-bold text-xs px-3 py-1.5 rounded-xl"
          >
            Installeer
          </button>
        </div>
      </div>
    </div>
  );
}
