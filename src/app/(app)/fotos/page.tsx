"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Upload, X, Heart, Camera, Images } from "lucide-react";

type Foto = {
  id: string;
  url: string;
  beschrijving: string | null;
  bulldog_naam: string | null;
  created_at: string;
  is_stichting: boolean;
  geliked: boolean;
  likes: number;
};

// Stichting inspiratie foto's (vast ingesteld)
const STICHTING_FOTOS = [
  { id: "s1", url: "/fotos/bulldog1.jpg", beschrijving: "Onze lieve Max na zijn operatie 🐾", bulldog_naam: "Max", is_stichting: true, geliked: false, likes: 24, created_at: "" },
  { id: "s2", url: "/fotos/bulldog2.jpg", beschrijving: "Bella op de Viervoetersdag", bulldog_naam: "Bella", is_stichting: true, geliked: false, likes: 18, created_at: "" },
  { id: "s3", url: "/fotos/bulldog3.jpg", beschrijving: "Droomend van zijn volgende avontuur", bulldog_naam: "Bruno", is_stichting: true, geliked: false, likes: 31, created_at: "" },
];

export default function FotosPage() {
  const [actieveTab, setActieveTab] = useState<"mijn" | "stichting">("stichting");
  const [mijnFotos, setMijnFotos] = useState<Foto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [geselecteerd, setGeselecteerd] = useState<Foto | null>(null);
  const [beschrijving, setBeschrijving] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actieveTab === "mijn") laadMijnFotos();
  }, [actieveTab]);

  async function laadMijnFotos() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("bulldog_fotos")
      .select("*")
      .eq("gebruiker_id", user.id)
      .order("created_at", { ascending: false });

    setMijnFotos(data?.map(f => ({ ...f, is_stichting: false, geliked: false })) || []);
  }

  async function uploadFoto(file: File) {
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext = file.name.split(".").pop();
    const filename = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("bulldog-fotos")
      .upload(filename, file, { contentType: file.type });

    if (!uploadError) {
      const { data } = supabase.storage.from("bulldog-fotos").getPublicUrl(filename);
      await supabase.from("bulldog_fotos").insert([{
        gebruiker_id: user.id,
        url: data.publicUrl,
        beschrijving: beschrijving || null,
      }]);
      setBeschrijving("");
      laadMijnFotos();
    }
    setUploading(false);
  }

  async function verwijderFoto(id: string) {
    if (!confirm("Foto verwijderen?")) return;
    const supabase = createClient();
    await supabase.from("bulldog_fotos").delete().eq("id", id);
    laadMijnFotos();
  }

  const stichtingFotos = STICHTING_FOTOS;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-primary px-4 pt-12 pb-4">
        <h1 className="font-display text-xl font-bold text-white mb-4">Foto's</h1>

        {/* Tabs */}
        <div className="flex bg-white/10 rounded-2xl p-1">
          <button
            onClick={() => setActieveTab("stichting")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
              actieveTab === "stichting"
                ? "bg-white text-primary"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Images size={16} /> Inspiratie
          </button>
          <button
            onClick={() => setActieveTab("mijn")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all ${
              actieveTab === "mijn"
                ? "bg-white text-primary"
                : "text-white/70 hover:text-white"
            }`}
          >
            <Camera size={16} /> Mijn foto's
          </button>
        </div>
      </header>

      {/* Stichting galerij */}
      {actieveTab === "stichting" && (
        <div className="px-4 py-4">
          <p className="text-gray-500 text-sm mb-4">
            Bulldogs die wij hebben mogen helpen 🐾
          </p>
          <div className="grid grid-cols-2 gap-3">
            {stichtingFotos.map((foto) => (
              <button
                key={foto.id}
                onClick={() => setGeselecteerd(foto)}
                className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100 active:scale-95 transition-transform"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                <div className="absolute inset-0 flex items-center justify-center text-5xl">🐾</div>
                <div className="absolute bottom-0 left-0 right-0 z-20 p-2">
                  {foto.bulldog_naam && (
                    <p className="text-white font-bold text-xs">{foto.bulldog_naam}</p>
                  )}
                  <div className="flex items-center gap-1 text-white/80 text-xs">
                    <Heart size={10} className="fill-white/80" />
                    <span>{foto.likes}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 bg-accent/15 border border-accent/30 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-primary mb-1">Jouw bulldog in de galerij?</p>
            <p className="text-xs text-gray-500 mb-3">Deel je verhaal via de stichting en inspireer anderen!</p>
            <a
              href="mailto:info@stichtingbulldogsteunfondsnederland.nl?subject=Foto voor galerij"
              className="btn-primary text-sm py-2"
            >
              📧 Neem contact op
            </a>
          </div>
        </div>
      )}

      {/* Mijn foto's */}
      {actieveTab === "mijn" && (
        <div className="px-4 py-4">
          {/* Upload sectie */}
          <div className="card mb-4">
            <h3 className="font-semibold text-primary mb-3">Foto toevoegen</h3>
            <input
              type="text"
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Voeg een beschrijving toe..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 mb-3"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadFoto(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn-primary w-full disabled:opacity-50"
            >
              <Camera size={16} />
              {uploading ? "Uploaden..." : "Kies foto"}
            </button>
          </div>

          {/* Mijn foto grid */}
          {mijnFotos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">📷</div>
              <p className="text-gray-400 font-medium">Nog geen foto's</p>
              <p className="text-gray-400 text-sm mt-1">Upload de eerste foto van je bulldog!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {mijnFotos.map((foto) => (
                <div key={foto.id} className="relative rounded-2xl overflow-hidden aspect-square bg-gray-100">
                  <Image src={foto.url} alt={foto.beschrijving || "Bulldog foto"} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {foto.beschrijving && (
                    <p className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium line-clamp-2">
                      {foto.beschrijving}
                    </p>
                  )}
                  <button
                    onClick={() => verwijderFoto(foto.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Foto detail modal */}
      {geselecteerd && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setGeselecteerd(null)}>
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white">
            <div className="relative aspect-square bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center text-8xl">🐾</div>
            </div>
            <div className="p-4">
              {geselecteerd.bulldog_naam && (
                <p className="font-display font-bold text-primary text-lg">{geselecteerd.bulldog_naam}</p>
              )}
              {geselecteerd.beschrijving && (
                <p className="text-gray-600 text-sm mt-1">{geselecteerd.beschrijving}</p>
              )}
              <div className="flex items-center gap-1 mt-2 text-gray-400 text-sm">
                <Heart size={14} className="fill-red-400 text-red-400" />
                <span>{geselecteerd.likes} mensen vinden dit mooi</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
