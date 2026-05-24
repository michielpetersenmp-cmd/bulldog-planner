-- Toevoegen aan supabase-planner.sql
-- ============================================
-- Bulldog foto's
-- ============================================
create table if not exists bulldog_fotos (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  beschrijving text,
  bulldog_naam text,
  likes integer default 0,
  created_at timestamptz default now()
);

alter table bulldog_fotos enable row level security;

create policy "Gebruiker ziet eigen fotos"
  on bulldog_fotos for select
  using (auth.uid() = gebruiker_id);

create policy "Gebruiker beheert eigen fotos"
  on bulldog_fotos for all
  using (auth.uid() = gebruiker_id);

-- Storage bucket voor foto's
-- Maak aan via: Supabase > Storage > New bucket
-- Naam: "bulldog-fotos"
-- Public: JA

create policy "Bulldog fotos zijn publiek leesbaar"
  on storage.objects for select
  using (bucket_id = 'bulldog-fotos');

create policy "Gebruiker kan eigen fotos uploaden"
  on storage.objects for insert
  with check (bucket_id = 'bulldog-fotos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Gebruiker kan eigen fotos verwijderen"
  on storage.objects for delete
  using (bucket_id = 'bulldog-fotos' and auth.uid()::text = (storage.foldername(name))[1]);
