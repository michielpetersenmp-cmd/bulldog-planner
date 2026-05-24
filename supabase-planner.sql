-- ============================================
-- Bulldog Planner PWA - Supabase Schema
-- Voer uit in: Supabase > SQL Editor
-- Gebruik het bestaande bulldog-steunfonds project
-- ============================================

-- ============================================
-- 1. Gebruikers profiel (aanvulling op Supabase Auth)
-- ============================================
create table if not exists planner_profielen (
  id uuid primary key references auth.users(id) on delete cascade,
  naam text,
  avatar_url text,
  bulldog_naam text,
  bulldog_ras text,
  bulldog_geboortedatum date,
  bulldog_foto_url text,
  push_enabled boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table planner_profielen enable row level security;

create policy "Gebruiker ziet eigen profiel"
  on planner_profielen for select
  using (auth.uid() = id);

create policy "Gebruiker bewerkt eigen profiel"
  on planner_profielen for all
  using (auth.uid() = id);

-- Auto-aanmaken profiel bij registratie
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into planner_profielen (id, naam, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- 2. Persoonlijke agenda items
-- ============================================
create table if not exists agenda_items (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references auth.users(id) on delete cascade not null,
  titel text not null,
  beschrijving text,
  datum date not null,
  tijd_start time,
  tijd_eind time,
  locatie text,
  type text default 'persoonlijk' check (type in (
    'persoonlijk', 'dierenarts', 'vaccinatie', 'medicatie',
    'verjaardag', 'training', 'evenement', 'overig'
  )),
  kleur text default '#1a2e5a',
  herhaling text default 'geen' check (herhaling in (
    'geen', 'dagelijks', 'wekelijks', 'maandelijks', 'jaarlijks'
  )),
  notificatie_minuten integer default 60,
  voltooid boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table agenda_items enable row level security;

create policy "Gebruiker ziet eigen agenda"
  on agenda_items for select
  using (auth.uid() = gebruiker_id);

create policy "Gebruiker beheert eigen agenda"
  on agenda_items for all
  using (auth.uid() = gebruiker_id);

create index agenda_items_gebruiker_datum_idx on agenda_items(gebruiker_id, datum);

-- ============================================
-- 3. Stichting evenementen (publiek)
-- ============================================
create table if not exists planner_evenementen (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  beschrijving text,
  datum date not null,
  tijd_start time,
  tijd_eind time,
  locatie text,
  locatie_url text,
  type text default 'evenement' check (type in (
    'evenement', 'actie', 'veiling', 'loterij', 'online', 'overig'
  )),
  afbeelding_url text,
  inschrijving_url text,
  max_deelnemers integer,
  published boolean default false,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table planner_evenementen enable row level security;

-- Iedereen mag evenementen lezen
create policy "Evenementen zijn publiek"
  on planner_evenementen for select
  using (published = true);

-- Alleen admins mogen schrijven (service role)
create policy "Admins beheren evenementen"
  on planner_evenementen for all
  using (auth.role() = 'service_role');

-- ============================================
-- 4. Evenement deelnames
-- ============================================
create table if not exists evenement_deelnames (
  id uuid primary key default gen_random_uuid(),
  evenement_id uuid references planner_evenementen(id) on delete cascade,
  gebruiker_id uuid references auth.users(id) on delete cascade,
  status text default 'aangemeld' check (status in ('aangemeld', 'aanwezig', 'afgemeld')),
  opmerking text,
  created_at timestamptz default now(),
  unique(evenement_id, gebruiker_id)
);

alter table evenement_deelnames enable row level security;

create policy "Gebruiker ziet eigen deelnames"
  on evenement_deelnames for select
  using (auth.uid() = gebruiker_id);

create policy "Gebruiker beheert eigen deelnames"
  on evenement_deelnames for all
  using (auth.uid() = gebruiker_id);

-- ============================================
-- 5. Push notificatie subscriptions
-- ============================================
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz default now(),
  unique(gebruiker_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "Gebruiker beheert eigen subscriptions"
  on push_subscriptions for all
  using (auth.uid() = gebruiker_id);

-- ============================================
-- 6. Notificatie log
-- ============================================
create table if not exists notificatie_log (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references auth.users(id) on delete cascade,
  titel text not null,
  bericht text,
  type text default 'algemeen' check (type in (
    'algemeen', 'blog', 'evenement', 'agenda', 'systeem'
  )),
  gelezen boolean default false,
  link text,
  created_at timestamptz default now()
);

alter table notificatie_log enable row level security;

create policy "Gebruiker ziet eigen notificaties"
  on notificatie_log for select
  using (auth.uid() = gebruiker_id);

create policy "Gebruiker beheert eigen notificaties"
  on notificatie_log for update
  using (auth.uid() = gebruiker_id);

-- ============================================
-- Triggers voor updated_at
-- ============================================
create trigger planner_profielen_updated_at
  before update on planner_profielen
  for each row execute function update_updated_at();

create trigger agenda_items_updated_at
  before update on agenda_items
  for each row execute function update_updated_at();

create trigger planner_evenementen_updated_at
  before update on planner_evenementen
  for each row execute function update_updated_at();

-- ============================================
-- Supabase Auth - Google & Facebook OAuth
-- Activeer in: Supabase > Authentication > Providers
-- Google: voeg Client ID + Secret toe
-- Facebook: voeg App ID + Secret toe
-- Redirect URL: https://bulldog-planner.vercel.app/auth/callback
-- ============================================

-- Voorbeeldevenementen
insert into planner_evenementen (titel, beschrijving, datum, tijd_start, locatie, type, published, featured)
values
(
  'Viervoetersdag 2025',
  'Jaarlijks evenement voor dierenliefhebbers. Kom langs bij onze stand!',
  '2025-09-15',
  '10:00',
  'Evenementenpark, Utrecht',
  'evenement',
  true,
  true
),
(
  'Bulldog Veiling - Online',
  'Onze jaarlijkse online veiling met prachtige donaties van supporters.',
  '2025-10-01',
  '19:00',
  'Online',
  'veiling',
  true,
  false
);
