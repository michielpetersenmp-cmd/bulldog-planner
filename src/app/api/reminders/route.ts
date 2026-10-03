import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

function amsterdamParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
  };
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function hourOf(time: string | null) {
  if (!time) return 9;
  const h = Number(time.slice(0, 2));
  return Number.isFinite(h) ? h : 9;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidEmail = process.env.VAPID_EMAIL || "mailto:info@stichtingbulldogsteunfondsnederland.nl";

  if (!url || !service || !vapidPublic || !vapidPrivate) {
    return NextResponse.json({ error: "Push-configuratie ontbreekt" }, { status: 503 });
  }

  webpush.setVapidDetails(vapidEmail, vapidPublic, vapidPrivate);
  const supabase = createClient(url, service);
  const now = amsterdamParts();
  const tomorrow = addDays(now.date, 1);

  const { data: events, error: eventsError } = await supabase
    .from("planner_evenementen")
    .select("*")
    .eq("published", true)
    .or(`datum.eq.${now.date},datum.eq.${tomorrow},deadline_datum.eq.${now.date}`);

  if (eventsError) return NextResponse.json({ error: eventsError.message }, { status: 500 });

  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("*");

  if (subError) return NextResponse.json({ error: subError.message }, { status: 500 });

  let sent = 0;

  for (const ev of events || []) {
    const reminders: { type: "dag_ervoor" | "start" | "deadline"; title: string; body: string }[] = [];

    if (ev.herinnering_dag_ervoor && ev.datum === tomorrow && now.hour === 9) {
      reminders.push({
        type: "dag_ervoor",
        title: `Morgen: ${ev.titel}`,
        body: "Morgen begint deze actie of dit evenement.",
      });
    }

    if (ev.herinnering_bij_start && ev.datum === now.date && now.hour === hourOf(ev.tijd_start)) {
      reminders.push({
        type: "start",
        title: `Vandaag: ${ev.titel}`,
        body: "Deze actie of dit evenement begint vandaag.",
      });
    }

    if (ev.herinnering_deadline && ev.deadline_datum === now.date && now.hour === hourOf(ev.deadline_tijd)) {
      reminders.push({
        type: "deadline",
        title: `Laatste kans: ${ev.titel}`,
        body: "Vandaag is de laatste dag om mee te doen.",
      });
    }

    for (const reminder of reminders) {
      for (const sub of subscriptions || []) {
        if (!sub.gebruiker_id) continue;

        const { data: existing } = await supabase
          .from("planner_notificatie_verzonden")
          .select("id")
          .eq("evenement_id", ev.id)
          .eq("gebruiker_id", sub.gebruiker_id)
          .eq("reminder_type", reminder.type)
          .maybeSingle();

        if (existing) continue;

        const payload = JSON.stringify({
          title: reminder.title,
          body: reminder.body,
          url: "/evenementen",
        });

        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          );

          await Promise.all([
            supabase.from("planner_notificatie_verzonden").insert({
              evenement_id: ev.id,
              gebruiker_id: sub.gebruiker_id,
              reminder_type: reminder.type,
            }),
            supabase.from("notificatie_log").insert({
              gebruiker_id: sub.gebruiker_id,
              titel: reminder.title,
              bericht: reminder.body,
              type: "evenement",
              link: "/evenementen",
            }),
          ]);

          sent++;
        } catch (error: any) {
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
