"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { createClient, typeIcoon, typeKleur } from "@/lib/supabase";
import type { AgendaItem } from "@/lib/supabase";

type Props = {
  item: AgendaItem | null;
  datum: Date;
  onClose: () => void;
  onSaved: () => void;
};

const TYPES = ["persoonlijk", "dierenarts", "vaccinatie", "medicatie", "verjaardag", "training", "evenement", "overig"];

export default function AgendaItemModal({ item, datum, onClose, onSaved }: Props) {
  const isEdit = !!item;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titel: item?.titel ?? "",
    beschrijving: item?.beschrijving ?? "",
    datum: item?.datum ?? datum.toISOString().split("T")[0],
    tijd_start: item?.tijd_start ?? "",
    tijd_eind: item?.tijd_eind ?? "",
    locatie: item?.locatie ?? "",
    type: item?.type ?? "persoonlijk",
    herhaling: item?.herhaling ?? "geen",
    notificatie_minuten: item?.notificatie_minuten ?? 60,
    voltooid: item?.voltooid ?? false,
  });

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.titel) { setError("Vul een titel in"); return; }
    setSaving(true);
    setError("");

    const supabase = createClient();
    const payload = {
      ...form,
      kleur: typeKleur[form.type] || "#1a2e5a",
      tijd_start: form.tijd_start || null,
      tijd_eind: form.tijd_eind || null,
      beschrijving: form.beschrijving || null,
      locatie: form.locatie || null,
    };

    if (isEdit) {
      const { error } = await supabase.from("agenda_items").update(payload).eq("id", item!.id);
      if (error) { setError(error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("agenda_items").insert([payload]);
      if (error) { setError(error.message); setSaving(false); return; }
    }

    onSaved();
  }

  async function handleDelete() {
    if (!isEdit || !confirm("Afspraak verwijderen?")) return;
    const supabase = createClient();
    await supabase.from("agenda_items").delete().eq("id", item!.id);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-primary">
              {isEdit ? "Afspraak bewerken" : "Nieuwe afspraak"}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Titel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Titel *</label>
              <input
                type="text"
                value={form.titel}
                onChange={(e) => update("titel", e.target.value)}
                placeholder="Bijv. Controle dierenarts"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
              <div className="grid grid-cols-4 gap-2">
                {TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => update("type", type)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs ${
                      form.type === type
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="text-lg">{typeIcoon[type]}</span>
                    <span className="font-medium text-gray-600 capitalize leading-tight text-center">
                      {type === "dierenarts" ? "Dierenarts" :
                       type === "vaccinatie" ? "Vaccinatie" :
                       type === "medicatie" ? "Medicatie" :
                       type === "verjaardag" ? "Verjaardag" :
                       type === "training" ? "Training" :
                       type === "evenement" ? "Evenement" :
                       type === "overig" ? "Overig" : "Persoonlijk"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Datum & tijd */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Datum</label>
                <input
                  type="date"
                  value={form.datum}
                  onChange={(e) => update("datum", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tijd</label>
                <input
                  type="time"
                  value={form.tijd_start}
                  onChange={(e) => update("tijd_start", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Locatie */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Locatie</label>
              <input
                type="text"
                value={form.locatie}
                onChange={(e) => update("locatie", e.target.value)}
                placeholder="Bijv. Dierenartspraktijk Utrecht"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Beschrijving */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notitie</label>
              <textarea
                value={form.beschrijving}
                onChange={(e) => update("beschrijving", e.target.value)}
                rows={2}
                placeholder="Extra informatie..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Voltooid (alleen bij bewerken) */}
            {isEdit && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.voltooid}
                  onChange={(e) => update("voltooid", e.target.checked)}
                  className="w-5 h-5 rounded accent-primary"
                />
                <span className="text-sm font-medium text-gray-700">Markeer als voltooid</span>
              </label>
            )}
          </div>

          {/* Knoppen */}
          <div className="mt-6 flex gap-3">
            {isEdit && (
              <button
                onClick={handleDelete}
                className="p-3 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="btn-secondary flex-1">
              Annuleren
            </button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? "Opslaan..." : isEdit ? "Opslaan" : "Toevoegen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
