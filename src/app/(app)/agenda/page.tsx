"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient, typeIcoon, typeKleur, formatTijd } from "@/lib/supabase";
import type { AgendaItem } from "@/lib/supabase";
import AgendaItemModal from "@/components/AgendaItemModal";

const DAGEN = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MAANDEN = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December"
];

export default function AgendaPage() {
  const [huidigeDatum, setHuidigeDatum] = useState(new Date());
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(new Date());
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [bewerkItem, setBewerkItem] = useState<AgendaItem | null>(null);

  const maand = huidigeDatum.getMonth();
  const jaar = huidigeDatum.getFullYear();

  useEffect(() => {
    laadItems();
  }, [maand, jaar]);

  async function laadItems() {
    setLoading(true);
    const supabase = createClient();
    const startDatum = `${jaar}-${String(maand + 1).padStart(2, "0")}-01`;
    const eindDatum = new Date(jaar, maand + 1, 0).toISOString().split("T")[0];

    const { data } = await supabase
      .from("agenda_items")
      .select("*")
      .gte("datum", startDatum)
      .lte("datum", eindDatum)
      .order("datum", { ascending: true });

    setItems(data || []);
    setLoading(false);
  }

  function getDagenInMaand() {
    const eerstedag = new Date(jaar, maand, 1);
    const aantalDagen = new Date(jaar, maand + 1, 0).getDate();
    // Maandag = 0
    let startDag = eerstedag.getDay() - 1;
    if (startDag < 0) startDag = 6;

    const dagen: (number | null)[] = [];
    for (let i = 0; i < startDag; i++) dagen.push(null);
    for (let i = 1; i <= aantalDagen; i++) dagen.push(i);
    return dagen;
  }

  function getItemsVoorDag(dag: number) {
    const dagStr = `${jaar}-${String(maand + 1).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
    return items.filter((item) => item.datum === dagStr);
  }

  function isVandaag(dag: number) {
    const nu = new Date();
    return nu.getDate() === dag && nu.getMonth() === maand && nu.getFullYear() === jaar;
  }

  function isGeselecteerd(dag: number) {
    return (
      geselecteerdeDag.getDate() === dag &&
      geselecteerdeDag.getMonth() === maand &&
      geselecteerdeDag.getFullYear() === jaar
    );
  }

  const geselecteerdeItems = getItemsVoorDag(geselecteerdeDag.getDate());

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-white">Mijn Agenda</h1>
          <button
            onClick={() => { setBewerkItem(null); setModalOpen(true); }}
            className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center"
          >
            <Plus size={20} className="text-primary" />
          </button>
        </div>

        {/* Maand navigatie */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setHuidigeDatum(new Date(jaar, maand - 1, 1))}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-white font-semibold">
            {MAANDEN[maand]} {jaar}
          </span>
          <button
            onClick={() => setHuidigeDatum(new Date(jaar, maand + 1, 1))}
            className="p-2 text-white/70 hover:text-white transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Dag headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAGEN.map((dag) => (
            <div key={dag} className="text-center text-white/50 text-xs font-semibold py-1">
              {dag}
            </div>
          ))}
        </div>

        {/* Kalender grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {getDagenInMaand().map((dag, idx) => {
            if (!dag) return <div key={`empty-${idx}`} />;
            const dagItems = getItemsVoorDag(dag);
            return (
              <button
                key={dag}
                onClick={() => setGeselecteerdeDag(new Date(jaar, maand, dag))}
                className={`relative flex flex-col items-center py-1.5 rounded-xl transition-all ${
                  isGeselecteerd(dag)
                    ? "bg-accent"
                    : isVandaag(dag)
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <span className={`text-sm font-semibold ${
                  isGeselecteerd(dag) ? "text-primary" : "text-white"
                }`}>
                  {dag}
                </span>
                {dagItems.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dagItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: isGeselecteerd(dag) ? "#1a2e5a" : item.kleur || "#F5C842" }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Geselecteerde dag items */}
      <div className="px-4 py-4">
        <h2 className="font-display font-bold text-primary mb-3">
          {geselecteerdeDag.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })}
        </h2>

        {geselecteerdeItems.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-400 text-sm">Geen afspraken op deze dag</p>
            <button
              onClick={() => { setBewerkItem(null); setModalOpen(true); }}
              className="mt-3 text-primary font-semibold text-sm underline"
            >
              Afspraak toevoegen
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {geselecteerdeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setBewerkItem(item); setModalOpen(true); }}
                className="w-full card flex items-start gap-3 text-left active:scale-98 transition-transform"
              >
                <div
                  className="w-1 self-stretch rounded-full shrink-0"
                  style={{ backgroundColor: item.kleur || "#1a2e5a" }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{typeIcoon[item.type] || "📅"}</span>
                    <span className="font-semibold text-primary text-sm">{item.titel}</span>
                    {item.voltooid && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓</span>
                    )}
                  </div>
                  {(item.tijd_start || item.locatie) && (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      {item.tijd_start && (
                        <p>🕐 {formatTijd(item.tijd_start)}{item.tijd_eind ? ` - ${formatTijd(item.tijd_eind)}` : ""}</p>
                      )}
                      {item.locatie && <p>📍 {item.locatie}</p>}
                    </div>
                  )}
                  {item.beschrijving && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.beschrijving}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <AgendaItemModal
          item={bewerkItem}
          datum={geselecteerdeDag}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); laadItems(); }}
        />
      )}
    </div>
  );
}
