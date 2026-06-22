-- ════════════════════════════════════════════════════════════════════════
-- MIGRACJA 2: tabela "settings" — przechowuje dane kontaktowe sklepu
-- ════════════════════════════════════════════════════════════════════════
-- Wklej to w nowym query w SQL Editor (Supabase) i kliknij "Run".
-- ════════════════════════════════════════════════════════════════════════

create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;

-- Każdy może czytać ustawienia (np. dane kontaktowe widoczne dla gości)
create policy "Każdy może czytać ustawienia" on settings
  for select using (true);

-- Tymczasowo: każdy może zapisywać ustawienia (do czasu podłączenia
-- prawdziwego logowania przez Supabase Auth — tak jak przy "products")
create policy "Tymczasowo każdy może zapisywać ustawienia" on settings
  for all using (true);

-- Domyślne dane kontaktowe — możesz je później zmienić w panelu admina sklepu
insert into settings (key, value) values (
  'contact_info',
  '{
    "companyName": "TARFIX",
    "address": "ul. Przykładowa 1, 00-001 Warszawa",
    "phone": "+48 123 456 789",
    "email": "kontakt@tarfix.pl",
    "hours": "Pon–Pt: 8:00–16:00",
    "mapEmbedUrl": "",
    "extraNote": "Zapraszamy do kontaktu w sprawie zamówień, reklamacji oraz współpracy."
  }'::jsonb
)
on conflict (key) do nothing;
