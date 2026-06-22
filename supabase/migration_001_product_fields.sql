-- ════════════════════════════════════════════════════════════════════════
-- MIGRACJA: dodatkowe kolumny dla zdjęć, rozszerzonego opisu i specyfikacji
-- ════════════════════════════════════════════════════════════════════════
-- Wklej to w SQL Editor w Supabase i kliknij "Run" — bezpiecznie dodaje
-- nowe kolumny do istniejącej tabeli "products" bez utraty danych.
-- ════════════════════════════════════════════════════════════════════════

alter table products add column if not exists photo text default '';
alter table products add column if not exists long_description text default '';
alter table products add column if not exists specs jsonb default '[]'::jsonb;
