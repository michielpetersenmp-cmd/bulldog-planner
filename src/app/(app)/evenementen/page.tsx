"use client";

import { useEffect, useState } from "react";
import { createClient, formatDatum, formatTijd } from "@/lib/supabase";
import type { Evenement } from "@/lib/supabase";
import { MapPin, Clock, Calendar } from "lucide-react";

const typeIcoon: Record<string, string> = {
  evenement: "🎪",
  actie: "🏆",
  veiling: "🔨",
  loterij: "🎟️",
  online: "💻",
  overig: "📌",
};

export default function EvenementenPage() {
  const [evenementen, setEvenementen] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function laad() {
      const supabase = createClient();
      const { data } = await supabase
        .from("planner_evenementen")
        .select("*")
        .eq("published", true)
        .gte("datum", new Date().toISOString().split("T")[0])
        .order("datum", { ascending: true });
      setEvenementen(data || []);
      setLoading(false);
    }
    laad();
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-primary px-4 pt-12 pb-6">
        <h1 className="font-display text-xl font-bold text-white mb-1">Evenementen</h1>
        <p className="text-white/60 text-sm">Stichting activiteiten & acties</p>
      </header>

      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <div className="text-center py-16 text-gray-400">Laden...</div>
        ) : evenementen.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🎪</div>
            <p className="text-gray-400 font-medium">Binnenkort meer evenementen</p>
          </div>
        ) : (
          evenementen.map((ev) => (
            <div key={ev.id} className="card">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-accent/15 rounded-2xl flex items-center justify-center shrink-0 text-2xl">
                  {typeIcoon[ev.type] || "📅"}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-primary leading-tight">{ev.titel}</h3>
                    {ev.featured && (
                      <span className="text-xs bg-accent/20 text-primary font-bold px-2 py-0.5 rounded-full shrink-0">⭐</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar size={12} />
                      <span>{formatDatum(ev.datum)}</span>
                    </div>
                    {ev.tijd_start && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{formatTijd(ev.tijd_start)}</span>
                      </div>
                    )}
                    {ev.locatie && (
                      <div className="flex items-center gap-1.
