-- ════════════════════════════════════════════════════════════════════════
-- TARFIX SHOP — Schemat bazy danych dla Supabase
-- ════════════════════════════════════════════════════════════════════════
-- Jak użyć: w panelu Supabase wejdź w "SQL Editor" (ikona w lewym menu),
-- kliknij "New query", wklej całą zawartość tego pliku i kliknij "Run".
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. KATEGORIE ──────────────────────────────────────────────────────────
-- Każda kategoria główna + lista jej podkategorii (jako tablica tekstów)
create table categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  subcategories text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ── 2. PRODUKTY ───────────────────────────────────────────────────────────
create table products (
  id bigint generated always as identity primary key,
  sku text,
  name text not null,
  category text not null,
  subcategory text default '',
  description text default '',
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  weight numeric(10,3) not null default 0,        -- waga w kg, używana do liczenia przesyłek
  unit text not null default 'szt',                -- szt / kg / tys / opak
  image text default '📦',                          -- emoji ikony produktu
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── 3. PROFILE KLIENTÓW ───────────────────────────────────────────────────
-- Uwaga: logowanie/hasła obsługuje Supabase Auth (tabela auth.users, wbudowana).
-- Ta tabela trzyma TYLKO dodatkowe dane sklepowe powiązane z kontem (rabat, rola).
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'customer',           -- 'customer' albo 'admin'
  discount integer not null default 0,              -- rabat w %
  created_at timestamptz not null default now()
);

-- ── 4. ZAMÓWIENIA ─────────────────────────────────────────────────────────
create table orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  guest_email text,                                  -- wypełnione tylko dla zamówień "jako gość"
  items jsonb not null,                               -- lista pozycji zamówienia (produkty + ilości)
  subtotal numeric(10,2) not null,
  discount integer not null default 0,
  discount_amt numeric(10,2) not null default 0,
  shipment_type text,                                 -- 'packages' / 'half-pallet' / 'pallet'
  shipment_label text,                                -- np. "2 paczki", "1/2 palety"
  shipping_cost numeric(10,2) not null default 0,
  free_shipping boolean not null default false,
  total numeric(10,2) not null,
  payment_method text,
  payment_status text,
  status text not null default 'Przyjęte',
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════
-- BEZPIECZEŃSTWO: Row Level Security (RLS)
-- ════════════════════════════════════════════════════════════════════════
-- Bez tego każdy mógłby odczytać/zmienić wszystkie dane przez publiczne API.
-- Włączamy RLS i definiujemy precyzyjne reguły dostępu dla każdej tabeli.

alter table categories enable row level security;
alter table products enable row level security;
alter table profiles enable row level security;
alter table orders enable row level security;

-- KATEGORIE: każdy zalogowany i niezalogowany użytkownik może czytać,
-- tylko admin może dodawać/edytować/usuwać.
create policy "Każdy może czytać kategorie" on categories
  for select using (true);

create policy "Tylko admin zarządza kategoriami" on categories
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PRODUKTY: każdy może czytać (sklep jest publiczny), tylko admin edytuje.
create policy "Każdy może czytać produkty" on products
  for select using (true);

create policy "Tylko admin zarządza produktami" on products
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- PROFILE: użytkownik widzi i edytuje tylko swój profil, admin widzi wszystkie.
create policy "Użytkownik widzi swój profil" on profiles
  for select using (
    auth.uid() = id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Użytkownik edytuje swój profil" on profiles
  for update using (auth.uid() = id);

create policy "Nowy użytkownik tworzy swój profil" on profiles
  for insert with check (auth.uid() = id);

create policy "Admin zarządza profilami klientów" on profiles
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ZAMÓWIENIA: użytkownik widzi tylko swoje zamówienia, admin widzi wszystkie.
-- Każdy (też gość) może złożyć nowe zamówienie.
create policy "Użytkownik widzi swoje zamówienia" on orders
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Każdy może złożyć zamówienie" on orders
  for insert with check (true);

create policy "Admin zarządza zamówieniami" on orders
  for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ════════════════════════════════════════════════════════════════════════
-- DANE STARTOWE: te same produkty/kategorie, które są teraz w kodzie sklepu
-- ════════════════════════════════════════════════════════════════════════

insert into categories (name, subcategories) values
  ('Elektronika', array['Laptopy', 'Audio', 'Smartwatche']),
  ('Spożywcze', array[]::text[]),
  ('Sport', array['Plecaki', 'Odzież sportowa']),
  ('Książki', array[]::text[]);

insert into products (sku, name, category, subcategory, description, price, stock, weight, unit, image) values
  ('LAP-001', 'Laptop Pro 15"', 'Elektronika', 'Laptopy', 'Wydajny laptop do pracy i rozrywki', 4999, 10, 2.2, 'szt', '💻'),
  ('SLU-002', 'Słuchawki Bluetooth', 'Elektronika', 'Audio', 'Bezprzewodowe słuchawki z ANC', 299, 25, 0.3, 'szt', '🎧'),
  ('KAW-003', 'Kawa Arabica 500g', 'Spożywcze', '', 'Świeżo palona kawa arabica', 45, 100, 0.5, 'opak', '☕'),
  ('PLE-004', 'Plecak Turystyczny', 'Sport', 'Plecaki', '30L plecak wodoodporny', 189, 15, 1.1, 'szt', '🎒'),
  ('KSI-005', 'Książka: React od Zera', 'Książki', '', 'Kompletny przewodnik po React', 59, 50, 0.6, 'szt', '📘'),
  ('SMA-006', 'Smartwatch Fit', 'Elektronika', 'Smartwatche', 'Smartwatch z monitorem zdrowia', 799, 8, 0.2, 'szt', '⌚');

-- ════════════════════════════════════════════════════════════════════════
-- FUNKCJA POMOCNICZA: automatyczne tworzenie profilu przy rejestracji
-- ════════════════════════════════════════════════════════════════════════
-- Gdy ktoś się rejestruje przez Supabase Auth, automatycznie tworzymy mu
-- wpis w tabeli "profiles" z domyślną rolą "customer" i rabatem 0%.

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role, discount)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'customer',
    0
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════
-- KONIEC. Po wykonaniu tego skryptu Twoja baza jest gotowa.
-- Następny krok: utworzenie pierwszego konta admina (zrobimy to ręcznie
-- w panelu Supabase, w sekcji Authentication → Users).
-- ════════════════════════════════════════════════════════════════════════
