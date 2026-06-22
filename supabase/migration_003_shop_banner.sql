-- ════════════════════════════════════════════════════════════════════════
-- MIGRACJA 3: domyślny wpis banera reklamowego na stronie głównej sklepu
-- ════════════════════════════════════════════════════════════════════════
-- Wklej to w nowym query w SQL Editor (Supabase) i kliknij "Run".
-- Wymaga, żeby tabela "settings" już istniała (migracja 2).
-- ════════════════════════════════════════════════════════════════════════

insert into settings (key, value) values (
  'shop_banner',
  '{
    "image": "",
    "link": "",
    "enabled": false
  }'::jsonb
)
on conflict (key) do nothing;
