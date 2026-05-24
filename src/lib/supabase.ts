import { createBrowserClient } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type AgendaItem = {
  id: string;
  gebruiker_id: string;
  titel: string;
  beschrijving: string | null;
  datum: string;
  tijd_start: string | null;
  tijd_eind: string | null;
  locatie: string | null;
  type: string;
  kleur: string;
  herhaling: string;
  notificatie_minuten: number;
  voltooid: boolean;
  created_at: string;
};

export type Evenement = {
  id: string;
  titel: string;
  beschrijving: string | null;
  datum: string;
  tijd_start: string | null;
  tijd_eind: string | null;
  locatie: string | null;
  locatie_url: string | null;
  type: string;
  afbeelding_url: string | null;
  inschrijving_url: string | null;
  max_deelnemers: number | null;
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type Profiel = {
  id: string;
  naam: string | null;
  avatar_url: string | null;
  bulldog_naam: string | null;
  bulldog_ras: string | null;
  bulldog_geboortedatum: string | null;
  bulldog_foto_url: string | null;
  push_enabled: boolean;
};

export function formatDatum(datum: string) {
  return new Date(datum).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTijd(tijd: string | null) {
  if (!tijd) return "";
  return tijd.substring(0, 5);
}

export const typeIcoon: Record<string, string> = {
  persoonlijk: "📅",
  dierenarts: "🏥",
  vaccinatie: "💉",
  medicatie: "💊",
  verjaardag: "🎂",
  training: "🐕",
  evenement: "🎪",
  overig: "📌",
};

export const typeKleur: Record<string, string> = {
  persoonlijk: "#1a2e5a",
  dierenarts: "#e53e3e",
  vaccinatie: "#38a169",
  medicatie: "#d69e2e",
  verjaardag: "#F5C842",
  training: "#3182ce",
  evenement: "#805ad5",
  overig: "#718096",
};
