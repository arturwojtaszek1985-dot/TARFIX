# TARFIX — Sklep internetowy

Projekt React (Vite) ze sklepem internetowym TARFIX: logowanie, rejestracja, koszyk,
płatności, panel administratora (produkty, kategorie, klienci, import CSV z WF-Mag),
kalkulacja przesyłek (paczki / pół-palety / europalety) i darmowa dostawa od 400 zł.

## 🚀 Najszybszy sposób wdrożenia: Vercel (darmowy)

### Krok 1 — Załóż konto na GitHub (jeśli nie masz)
Wejdź na https://github.com i zarejestruj się (darmowe).

### Krok 2 — Wgraj ten projekt na GitHub
1. Stwórz nowe, prywatne repozytorium (przycisk "New repository").
2. Wgraj **wszystkie pliki z tego folderu** (przycisk "uploading an existing file"
   na stronie nowego repo, albo użyj `git` jeśli wiesz jak).

### Krok 3 — Połącz z Vercel
1. Wejdź na https://vercel.com i zaloguj się przez GitHub (przycisk "Continue with GitHub").
2. Kliknij "Add New... → Project".
3. Wybierz repozytorium, które właśnie wgrałeś.
4. Vercel **automatycznie wykryje, że to projekt Vite** — nic nie musisz konfigurować.
5. Kliknij "Deploy".

Po 1-2 minutach strona będzie żywa pod adresem typu `twoj-projekt.vercel.app`.

### Krok 4 — Kolejne zmiany
Każda zmiana w plikach na GitHubie (np. edycja `src/App.jsx`) automatycznie
wywoła nowy deploy na Vercel. Nie musisz nic więcej robić.

## 🖥️ Praca lokalna (na własnym komputerze)

Jeśli masz zainstalowany Node.js (https://nodejs.org), możesz pracować lokalnie:

```bash
npm install        # instaluje zależności (jednorazowo)
npm run dev        # uruchamia podgląd na http://localhost:5173
npm run build      # tworzy finalną wersję produkcyjną w folderze dist/
```

## 📁 Wgranie na zwykły hosting (FTP / cPanel)

Jeśli wolisz tradycyjny hosting bez GitHub/Vercel:

1. Zainstaluj Node.js na swoim komputerze: https://nodejs.org
2. W folderze projektu uruchom:
   ```bash
   npm install
   npm run build
   ```
3. Powstanie folder `dist/` — to jest Twoja gotowa strona (czysty HTML/CSS/JS).
4. Wgraj **całą zawartość folderu `dist/`** (nie sam folder, tylko to co jest w nim)
   na swój serwer przez FTP, do głównego katalogu strony (często `public_html`).
5. Strona działa od razu — nie wymaga PHP, bazy danych, Node.js na serwerze.

## ⚠️ Ważna uwaga o danych

Ten sklep przechowuje dane (produkty, klientów, zamówienia) **tylko w pamięci
przeglądarki** — po odświeżeniu strony wszystko wraca do stanu początkowego.
To jest świetne do testów i prezentacji, ale do prawdziwego sklepu z klientami
będziesz potrzebować bazy danych i backendu. Daj znać, jeśli chcesz to dodać —
to naturalny następny krok rozwoju.
