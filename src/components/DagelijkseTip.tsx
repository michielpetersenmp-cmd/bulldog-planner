"use client";

import { useMemo } from "react";

const CONTENT = [
  // Tips over bulldogverzorging
  { type: "tip", tekst: "Reinig de huidplooien van je bulldog dagelijks met een vochtig doekje om infecties te voorkomen.", emoji: "🧴" },
  { type: "tip", tekst: "Bulldogs oververhitten snel. Ga alleen vroeg in de ochtend of laat in de avond wandelen bij warm weer.", emoji: "🌡️" },
  { type: "tip", tekst: "Controleer regelmatig de ogen van je bulldog op roodheid of afscheiding. Bij twijfel altijd naar de dierenarts.", emoji: "👁️" },
  { type: "tip", tekst: "Geef je bulldog nooit te veel te eten — ze zijn gevoelig voor obesitas, wat hun ademhaling verslechtert.", emoji: "🥗" },
  { type: "tip", tekst: "Borstels je bulldog wekelijks om losse haren te verwijderen en de huid te stimuleren.", emoji: "🖌️" },
  { type: "tip", tekst: "Zorg altijd voor vers, koud water. Bulldogs drinken veel en raken snel oververhit.", emoji: "💧" },
  { type: "tip", tekst: "Knip de nagels van je bulldog maandelijks. Te lange nagels kunnen pijnlijke gewrichten veroorzaken.", emoji: "✂️" },
  { type: "tip", tekst: "Poets de tanden van je bulldog minstens 2-3 keer per week om tandvleesontsteking te voorkomen.", emoji: "🦷" },
  { type: "tip", tekst: "Laat je bulldog nooit onbeheerd in een warme auto — zelfs 5 minuten kan gevaarlijk zijn.", emoji: "🚗" },
  { type: "tip", tekst: "Een goede vakantieoppas die bulldogs kent is goud waard. Regel dit ruim van tevoren.", emoji: "🏖️" },
  { type: "tip", tekst: "Bulldogs snurken — dat is normaal! Zorg wel voor een comfortabele slaapplek met goede ventilatie.", emoji: "😴" },
  { type: "tip", tekst: "Laat je bulldog jaarlijks checken op BAS (brachycefaal airway syndroom) bij een specialist.", emoji: "🏥" },
  { type: "tip", tekst: "Speel nooit te intensief met je bulldog — korte speelsessies van 10-15 minuten zijn genoeg.", emoji: "🎾" },
  { type: "tip", tekst: "Gebruik een tuig in plaats van een halsband — dat is veel beter voor de luchtwegen van je bulldog.", emoji: "🐕" },
  { type: "tip", tekst: "Controleer de staartplooi regelmatig op roodheid of geur — dit is een veelvoorkomende plek voor infecties.", emoji: "🔍" },
  // Inspirerende quotes
  { type: "quote", tekst: "Een huis is geen thuis zonder een bulldog.", emoji: "🏠", auteur: "Onbekend" },
  { type: "quote", tekst: "De liefde van een hond is één van de weinige onvoorwaardelijke dingen in het leven.", emoji: "❤️", auteur: "Onbekend" },
  { type: "quote", tekst: "Totdat ik een hond had, wist ik niet wat onvoorwaardelijke liefde betekende.", emoji: "🐾", auteur: "Onbekend" },
  { type: "quote", tekst: "Een bulldog kijkt altijd boos maar is eigenlijk de liefste ziel.", emoji: "😤", auteur: "Bulldogliefhebber" },
  { type: "quote", tekst: "Het goede aan een hond is dat hij je altijd blij is te zien — zelfs als je vijf minuten weg was.", emoji: "🥰", auteur: "Onbekend" },
  { type: "quote", tekst: "Een hond geeft je zijn hart volledig. Geen contracten, geen clausules.", emoji: "💛", auteur: "Onbekend" },
  { type: "quote", tekst: "Bulldogs lopen niet — ze paraderen.", emoji: "👑", auteur: "Iedere bulldogeigenaar" },
  { type: "quote", tekst: "Je kunt de waarde van een hond afmeten aan de grootte van de leegte die hij achterlaat.", emoji: "🌟", auteur: "Onbekend" },
  { type: "quote", tekst: "Honden begrijpen jou beter dan je denkt — ze zien wie je echt bent.", emoji: "✨", auteur: "Onbekend" },
  { type: "quote", tekst: "Een bulldog is niet voor iedereen — maar voor degene die er één heeft, is er geen betere vriend.", emoji: "🏆", auteur: "Onbekend" },
];

export default function DagelijkseTip() {
  const item = useMemo(() => {
    const dagVanJaar = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return CONTENT[dagVanJaar % CONTENT.length];
  }, []);

  const isTip = item.type === "tip";

  return (
    <div className={`mx-4 mt-4 rounded-2xl p-4 ${
      isTip
        ? "bg-primary/6 border border-primary/10"
        : "bg-accent/15 border border-accent/30"
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{item.emoji}</span>
        <div>
          <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${
            isTip ? "text-primary/60" : "text-primary/60"
          }`}>
            {isTip ? "💡 Tip van de dag" : "✨ Quote van de dag"}
          </p>
          <p className="text-sm text-primary leading-relaxed font-medium">
            {item.tekst}
          </p>
          {"auteur" in item && (
            <p className="text-xs text-gray-400 mt-1">— {item.auteur}</p>
          )}
        </div>
      </div>
    </div>
  );
}
