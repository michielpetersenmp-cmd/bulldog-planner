"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import type { Profiel } from "@/lib/supabase";
import { LogOut, Camera, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfielPage() {
  const [profiel, setProfiel] = useState<Profiel | null>(null);
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    naam: "",
    bulldog_naam: "",
    bulldog_ras: "",
    bulldog_geboortedatum: "",
  });
  const router = useRouter();

  useEffect(() => {
    laadProfiel();
  }, []);

  async function laadProfiel() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    const { data } = await supabase
      .from("planner_profielen")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfiel(data);
      setForm({
        naam: data.naam || "",
        bulldog_naam: data.bulldog_naam || "",
        bulldog_ras: data.bulldog_ras || "",
        bulldog_geboortedatum: data.bulldog_geboortedatum || "",
      });
    }
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("planner_profielen")
      .update(form)
      .eq("id", user.id);
    await laadProfiel();
    setEditing(false);
    setSaving(false);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-primary px-4 pt-12 pb-16">
        <h1 className="font-display text-xl font-bold text-white">Mijn Profiel</h1>
      </header>

      {/* Avatar */}
      <div className="px-4 -mt-10 mb-4">
        <div className="card flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <Image
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-primary">{profiel?.naam || user?.email}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Ingelogd via {user?.app_metadata?.provider === "google" ? "Google" : "Facebook"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Mijn bulldog */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-primary">Mijn Bulldog</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-primary font-semibold text-sm"
            >
              {editing ? "Annuleren" : "Bewerken"}
            </button>
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { field: "naam", label: "Jouw naam", placeholder: "Jan de Vries" },
                { field: "bulldog_naam", label: "Naam bulldog", placeholder: "Max" },
                { field: "bulldog_ras", label: "Ras", placeholder: "Engelse Bulldog" },
                { field: "bulldog_geboortedatum", label: "Geboortedatum", type: "date" },
              ].map((item) => (
                <div key={item.field}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{item.label}</label>
                  <input
                    type={item.type || "text"}
                    value={(form as any)[item.field]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [item.field]: e.target.value }))}
                    placeholder={item.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
              <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-2">
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Jouw naam", value: profiel?.naam },
                { label: "Naam bulldog", value: profiel?.bulldog_naam, icon: "🐕" },
                { label: "Ras", value: profiel?.bulldog_ras },
                { label: "Geboortedatum", value: profiel?.bulldog_geboortedatum ?
                  new Date(profiel.bulldog_geboortedatum).toLocaleDateString("nl-NL") : null },
              ].map((item) => item.value && (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{item.label}</span>
                  <span className="text-sm font-medium text-primary">
                    {item.icon} {item.value}
                  </span>
                </div>
              ))}
              {!profiel?.bulldog_naam && (
                <p className="text-gray-400 text-sm text-center py-2">
                  Voeg je bulldog toe via bewerken
                </p>
              )}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="card space-y-2">
          <a
            href="https://stichtingbulldogsteunfondsnederland.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-primary">🌐 Website stichting</span>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
          <a
            href="https://stichtingbulldogsteunfondsnederland.nl/aanvragen"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-primary">🏥 Hulp aanvragen</span>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
          <a
            href="https://stichtingbulldogsteunfondsnederland.nl/doneren"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm font-medium text-primary">💛 Doneer nu</span>
            <ExternalLink size={14} className="text-gray-400" />
          </a>
        </div>

        {/* Uitloggen */}
        <button
          onClick={logout}
          className="w-full card flex items-center justify-center gap-2 text-red-500 font-semibold"
        >
          <LogOut size={18} />
          Uitloggen
        </button>

        <p className="text-center text-xs text-gray-400 pb-4">
          Bulldog Planner v1.0 · Stichting Bulldog Steunfonds Nederland
        </p>
      </div>
    </div>
  );
}
