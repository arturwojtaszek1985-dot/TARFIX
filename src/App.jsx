import { useState, useRef, useCallback, useEffect, Fragment } from "react";
import Papa from "papaparse";
import jsPDF from "jspdf";
import * as api from "./api";

const LOGO_TARFIX = "data:image/png;base64,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";

// ── Dane startowe ─────────────────────────────────────────────────────────────
// UWAGA: konta użytkowników są teraz zarządzane przez Supabase Auth (tabela
// auth.users + profiles). Lista użytkowników w pamięci nie zawiera już haseł
// ani kont testowych — panel "Klienci" zostanie podpięty do profiles osobno.
const INITIAL_USERS = [];

const DEFAULT_UNITS = [
  { value: "szt", label: "sztuka" },
  { value: "kg", label: "kg" },
  { value: "g", label: "gram" },
  { value: "t", label: "tona" },
  { value: "tys", label: "tysiąc" },
  { value: "opak", label: "opakowanie" },
  { value: "kpl", label: "komplet" },
  { value: "para", label: "para" },
  { value: "m", label: "metr" },
  { value: "m2", label: "metr kwadratowy" },
  { value: "m3", label: "metr sześcienny" },
  { value: "l", label: "litr" },
  { value: "pal", label: "paleta" },
  { value: "rolka", label: "rolka" },
  { value: "ark", label: "arkusz" },
];

// Mapa typowych skrótów jednostek z systemów WF-Mag/innych na nasze symbole.
// Używana do automatycznego dopasowania jednostki z CSV do istniejącej lub
// do podpowiedzi sensownej etykiety, gdy trzeba założyć nową jednostkę.
const UNIT_ALIASES = {
  "szt": "szt", "sztuka": "szt", "sztuk": "szt", "pcs": "szt", "pc": "szt", "ks": "szt",
  "kg": "kg", "kilogram": "kg", "kilogramy": "kg",
  "g": "g", "gram": "g", "gramy": "g",
  "t": "t", "tona": "t", "tony": "t",
  "tys": "tys", "tysiąc": "tys", "tys.": "tys",
  "opak": "opak", "opakowanie": "opak", "op": "opak", "op.": "opak",
  "kpl": "kpl", "komplet": "kpl", "komplety": "kpl",
  "par": "para", "para": "para", "pary": "para",
  "m": "m", "mb": "m", "metr": "m", "metry": "m",
  "m2": "m2", "m²": "m2", "metr2": "m2",
  "m3": "m3", "m³": "m3", "metr3": "m3",
  "l": "l", "litr": "l", "litry": "l",
  "pal": "pal", "paleta": "pal", "palety": "pal",
  "rolka": "rolka", "rolki": "rolka", "rol": "rolka",
  "ark": "ark", "arkusz": "ark", "arkusze": "ark",
};

const INITIAL_PRODUCTS = [
  { id: 1, name: "Laptop Pro 15\"", category: "Elektronika", subcategory: "Laptopy", price: 4999, stock: 10, weight: 2.2, unit: "szt", image: "💻", description: "Wydajny laptop do pracy i rozrywki", sku: "LAP-001" },
  { id: 2, name: "Słuchawki Bluetooth", category: "Elektronika", subcategory: "Audio", price: 299, stock: 25, weight: 0.3, unit: "szt", image: "🎧", description: "Bezprzewodowe słuchawki z ANC", sku: "SLU-002" },
  { id: 3, name: "Kawa Arabica 500g", category: "Spożywcze", subcategory: "", price: 45, stock: 100, weight: 0.5, unit: "opak", image: "☕", description: "Świeżo palona kawa arabica", sku: "KAW-003" },
  { id: 4, name: "Plecak Turystyczny", category: "Sport", subcategory: "Plecaki", price: 189, stock: 15, weight: 1.1, unit: "szt", image: "🎒", description: "30L plecak wodoodporny", sku: "PLE-004" },
  { id: 5, name: "Książka: React od Zera", category: "Książki", subcategory: "", price: 59, stock: 50, weight: 0.6, unit: "szt", image: "📘", description: "Kompletny przewodnik po React", sku: "KSI-005" },
  { id: 6, name: "Smartwatch Fit", category: "Elektronika", subcategory: "Smartwatche", price: 799, stock: 8, weight: 0.2, unit: "szt", image: "⌚", description: "Smartwatch z monitorem zdrowia", sku: "SMA-006" },
];

// ── Logika przesyłek ──────────────────────────────────────────────────────────
const PACKAGE_MAX_KG = 25;
const SHIPPING_PER_PACKAGE = 15;
const FREE_SHIPPING_THRESHOLD = 400;
const HALF_PALLET_THRESHOLD_KG = 100;
const FULL_PALLET_THRESHOLD_KG = 200;
const SHIPPING_HALF_PALLET = 120;
const SHIPPING_FULL_PALLET = 200;

// Oblicza ile paczek potrzeba metodą "bin packing" (first-fit) na podstawie wagi i ilości każdej pozycji w koszyku
function calculatePackages(cartItems) {
  // Rozbij każdą pozycję na pojedyncze jednostki wagowe (qty x weight), żeby poprawnie pakować pojedyncze produkty do paczek
  const units = [];
  cartItems.forEach(item => {
    const w = item.weight || 0;
    for (let i = 0; i < item.qty; i++) units.push(w);
  });
  // Sortuj od najciężutszych — lepsze upakowanie (first-fit decreasing)
  units.sort((a, b) => b - a);

  const packages = []; // każda paczka to suma wag
  units.forEach(w => {
    // Jeśli pojedyncza jednostka sama przekracza limit paczki, dzielimy ją na własne, osobne paczki
    if (w > PACKAGE_MAX_KG) {
      let remaining = w;
      while (remaining > 0) {
        const chunk = Math.min(remaining, PACKAGE_MAX_KG);
        packages.push(chunk);
        remaining -= chunk;
      }
      return;
    }
    // Spróbuj zmieścić w istniejącej paczce
    let placed = false;
    for (let i = 0; i < packages.length; i++) {
      if (packages[i] + w <= PACKAGE_MAX_KG) {
        packages[i] += w;
        placed = true;
        break;
      }
    }
    if (!placed) packages.push(w);
  });
  return packages; // np. [24.5, 18.2] -> 2 paczki
}

// Klasyfikuje sposób wysyłki na podstawie całkowitej wagi koszyka:
// > 200kg -> europaleta, > 100kg -> 1/2 palety, inaczej liczone paczki po max 25kg
function classifyShipment(cartItems) {
  const totalWeight = cartItems.reduce((s, i) => s + (i.weight || 0) * i.qty, 0);
  if (totalWeight > FULL_PALLET_THRESHOLD_KG) {
    return { type: "pallet", label: "Europaleta", count: 1, totalWeight, baseCost: SHIPPING_FULL_PALLET };
  }
  if (totalWeight > HALF_PALLET_THRESHOLD_KG) {
    return { type: "half-pallet", label: "1/2 palety", count: 1, totalWeight, baseCost: SHIPPING_HALF_PALLET };
  }
  const packages = calculatePackages(cartItems);
  return { type: "packages", label: packages.length === 1 ? "1 paczka" : `${packages.length} paczki`, count: packages.length, totalWeight, baseCost: packages.length * SHIPPING_PER_PACKAGE, packages };
}

// Wzorcowy CSV z WF-Mag (do pobrania jako przykład)
const SAMPLE_CSV = `Indeks;Nazwa;Kategoria;Cena netto;Cena brutto;Stan magazynowy;Opis;Jednostka
LAP-001;Laptop Pro 15";Elektronika;4064,23;4999,00;12;Wydajny laptop do pracy i rozrywki;szt
SLU-002;Słuchawki Bluetooth;Elektronika;243,09;299,00;30;Bezprzewodowe słuchawki z ANC;szt
KAW-003;Kawa Arabica 500g;Spożywcze;36,59;45,00;85;Świeżo palona kawa arabica;kg
PLE-004;Plecak Turystyczny;Sport;153,66;189,00;20;30L plecak wodoodporny;szt
KSI-005;Książka: React od Zera;Książki;47,97;59,00;60;Kompletny przewodnik po React;szt
SMA-006;Smartwatch Fit;Elektronika;649,59;799,00;3;Smartwatch z monitorem zdrowia;szt
MON-007;Monitor 27" 4K;Elektronika;1219,51;1500,00;5;Profesjonalny monitor do pracy;szt
MYS-008;Mysz bezprzewodowa;Elektronika;81,30;100,00;40;Ergonomiczna mysz optyczna;szt
KLA-009;Klawiatura mechaniczna;Elektronika;243,09;299,00;18;RGB, przełączniki Blue;szt`;

// Domyślne mapowanie kolumn WF-Mag → sklep
const DEFAULT_MAPPING = {
  sku: "Indeks",
  name: "Nazwa",
  category: "Kategoria",
  price: "Cena brutto",
  stock: "Stan magazynowy",
  description: "Opis",
  unit: "Jednostka",
};

const EMOJI_MAP = {
  "Elektronika": "💻", "Spożywcze": "🛒", "Sport": "🏋️",
  "Książki": "📘", "Odzież": "👕", "Dom": "🏠",
  "Zdrowie": "💊", "Motoryzacja": "🚗", "Zabawki": "🎮",
};
const getEmoji = (cat) => EMOJI_MAP[cat] || "📦";

const fmt = (n) => (+n || 0).toLocaleString("pl-PL", { style: "currency", currency: "PLN" });

// OMNIBUS: czy produkt ma aktywną promocję (cena promocyjna < regularna i > 0)
const hasPromo = (p) => p?.promoPrice != null && p.promoPrice > 0 && p.promoPrice < p.price;
// Cena efektywna = promocyjna jeśli aktywna, w przeciwnym razie regularna.
// To jest cena, od której naliczany jest rabat klienta i która trafia do koszyka.
const effPrice = (p) => (hasPromo(p) ? p.promoPrice : p.price);

// WARIANTY (styl Allegro): produkt ma grupy atrybutów i kombinacje (warianty).
const hasVariants = (p) =>
  Array.isArray(p?.attributeGroups) && p.attributeGroups.length > 0 &&
  Array.isArray(p?.variants) && p.variants.length > 0;
// Znajduje wariant pasujący do pełnej kombinacji wyborów (obiekt {grupa: wartość}).
const findVariant = (p, combo) =>
  (p.variants || []).find(v => (p.attributeGroups || []).every(g => v.combo?.[g.name] === combo[g.name]));
// Zbiór wartości danej grupy, które są osiągalne przy bieżących wyborach w pozostałych grupach
// (do wyszarzania niedostępnych kafelków).
const availableValues = (p, groupName, combo) => {
  const others = (p.attributeGroups || []).filter(g => g.name !== groupName);
  const set = new Set();
  (p.variants || []).forEach(v => {
    const matchOthers = others.every(g => !combo[g.name] || v.combo?.[g.name] === combo[g.name]);
    if (matchOthers && v.combo?.[groupName] != null) set.add(v.combo[groupName]);
  });
  return set;
};
const minVariantPrice = (p) => {
  const prices = (p.variants || []).map(v => +v.price || 0).filter(n => n > 0);
  return prices.length ? Math.min(...prices) : 0;
};
const comboLabel = (combo) => Object.values(combo || {}).join(" · ");

// Auto-zaznaczanie: dla każdej grupy atrybutów, w której realnie jest tylko jedna
// dostępna wartość, ustawia ją od razu. Gdy produkt ma jeden wariant — zaznacza go
// w całości (klient od razu widzi cenę, bez klikania).
const autoSelectCombo = (p) => {
  if (!hasVariants(p)) return {};
  const combo = {};
  (p.attributeGroups || []).forEach(g => {
    const vals = availableValues(p, g.name, combo);
    if (vals.size === 1) combo[g.name] = [...vals][0];
  });
  return combo;
};

// VAT: ceny wariantów wpisywane są jako NETTO; brutto liczone automatycznie (23%).
const VAT_RATE = 0.23;
const grossOf = (net) => Math.round((+net || 0) * (1 + VAT_RATE) * 100) / 100;
const netOf = (gross) => Math.round((+gross || 0) / (1 + VAT_RATE) * 100) / 100;

// ── ADRESY URL PRODUKTÓW (routing przez History API) ────────────────────────
const slugify = (s) => (s || "")
  .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const productPath = (p) => p ? `/produkt/${slugify(p.name)}-${p.id}` : "/";
// Wyciąga ID produktu z końca ścieżki (obsługuje /produkt/123 i /produkt/nazwa-123).
const parseProductId = (path) => {
  const m = (path || "").match(/\/produkt\/(?:.*-)?(\d+)\/?$/);
  return m ? Number(m[1]) : null;
};
const parseNum = (s) => parseFloat(String(s).replace(",", ".").replace(/\s/g, "")) || 0;

// ── IMPORT WARIANTÓW: helpery ───────────────────────────────────────────────
// Wyznacza klucz grupujący z SKU wg wybranej reguły.
const skuPrefix = (sku, rule, n) => {
  const s = String(sku || "").trim();
  if (!s) return "";
  if (rule === "first") { const i = s.indexOf("-"); return i > 0 ? s.slice(0, i) : s; }
  if (rule === "chars") { return s.slice(0, Math.max(1, +n || 3)); }
  // domyślnie: do ostatniego myślnika (np. WKR-CIES-6x40 -> WKR-CIES)
  const i = s.lastIndexOf("-");
  return i > 0 ? s.slice(0, i) : s;
};
// Wyciąga rozmiar typu „6x40”, „4,2x19”, „M8x80” z nazwy. Zwraca znormalizowany token albo null.
const extractSize = (name) => {
  const m = String(name || "").match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
  if (m) return `${m[1].replace(",", ".")}x${m[2].replace(",", ".")}`;
  // sam wymiar gwintu/średnicy: M8, Ø6, fi6
  const m2 = String(name || "").match(/\b([MØ]\s?\d+(?:[.,]\d+)?)\b/i);
  if (m2) return m2[1].replace(/\s/g, "").replace(",", ".");
  return null;
};
// Najdłuższy wspólny przedrostek listy napisów (do bazowej nazwy produktu).
const longestCommonPrefix = (arr) => {
  if (!arr.length) return "";
  let p = arr[0];
  for (const s of arr.slice(1)) {
    let i = 0;
    while (i < p.length && i < s.length && p[i] === s[i]) i++;
    p = p.slice(0, i);
    if (!p) break;
  }
  return p.replace(/[\s\-–,.:x×]+$/i, "").trim();
};

// ── Style ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter',sans-serif;background:#f5f5f5;color:#1c1c1c}
  :root{
    --primary:#1cb88a;--primary-dark:#17956f;--primary-light:#e3f7ef;--primary-mid:#3fc98a;
    --success:#2d8a4e;--danger:#c0392b;--warning:#e67e22;
    --surface:#fff;--border:#e0e0e0;--muted:#7a7a7a;
    --radius:10px;--shadow:0 1px 4px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.05);
    --shadow-md:0 4px 12px rgba(28,184,138,.15),0 2px 4px rgba(0,0,0,.06);
  }
  .app{min-height:100vh;display:flex;flex-direction:column}
  .navbar{background:#111722;color:#fff;padding:0 20px;min-height:62px;display:flex;flex-direction:column;justify-content:center;position:sticky;top:0;z-index:100;box-shadow:0 2px 8px rgba(0,0,0,.35);border-bottom:3px solid var(--primary)}
  .navbar-inner{display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px;flex-wrap:wrap;padding:8px 0}
  .navbar-brand{font-size:1.2rem;font-weight:700;letter-spacing:-.5px;color:#fff;white-space:nowrap;flex-shrink:0}
  .navbar-brand span{color:var(--primary)}
  .nav-left{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
  .nav-right{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto}
  .main{flex:1;padding:28px 24px;max-width:1300px;margin:0 auto;width:100%}

  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:none;border-radius:8px;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap}
  .btn-primary{background:var(--primary);color:#fff}.btn-primary:hover{background:var(--primary-dark)}
  .btn-secondary{background:var(--surface);color:var(--primary);border:1.5px solid var(--primary)}.btn-secondary:hover{background:var(--primary-light)}
  .btn-danger{background:var(--danger);color:#fff}.btn-danger:hover{background:#a93226}
  .btn-success{background:var(--success);color:#fff}.btn-success:hover{background:#236b3d}
  .btn-warning{background:var(--warning);color:#fff}.btn-warning:hover{background:#ca6f1e}
  .btn-ghost{background:transparent;color:#fff;padding:6px 12px}.btn-ghost:hover{background:rgba(255,255,255,.12);border-radius:8px}
  .btn-ghost.active{background:var(--primary);border-radius:8px}
  .btn-sm{padding:5px 10px;font-size:.8rem}
  .btn:disabled{opacity:.5;cursor:not-allowed}

  .card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow);padding:20px;border:1px solid var(--border)}
  .card-title{font-size:1.1rem;font-weight:600;margin-bottom:16px;color:#1c1c1c}

  .form-group{margin-bottom:14px}
  .form-label{display:block;font-size:.875rem;font-weight:500;margin-bottom:5px;color:#333}
  .form-input{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:.875rem;outline:none;transition:border .15s;background:#fff;color:#1c1c1c}
  .form-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px var(--primary-light)}
  .form-select{width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:.875rem;background:#fff;outline:none}
  .form-select:focus{border-color:var(--primary)}

  .badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.75rem;font-weight:500}
  .badge-blue{background:#e3f7ef;color:#17956f}
  .badge-green{background:#e6f4ec;color:#2d8a4e}
  .badge-orange{background:#e3f7ef;color:#1cb88a}
  .badge-red{background:#fdecea;color:#c0392b}
  .badge-gray{background:#f0f0f0;color:#555}
  .badge-yellow{background:#fef6e4;color:#b7770d}

  .tabs{display:flex;gap:8px;background:transparent;border-radius:10px;padding:0 0 4px;margin-bottom:24px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:thin}
  .tabs::-webkit-scrollbar{height:5px}
  .tabs::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:99px}
  .tab{flex-shrink:0;padding:9px 18px;border:2px solid var(--primary);border-radius:999px;background:#fff;font-size:.85rem;font-weight:600;cursor:pointer;transition:all .15s;color:var(--primary)}
  .tab:hover{background:var(--primary-light)}
  .tab.active{background:var(--primary);color:#fff;box-shadow:0 2px 8px rgba(28,184,138,.35);border-color:var(--primary)}

  .subcat-tabs{margin-top:-12px;margin-bottom:20px;gap:6px}

  /* ── Sklep: panel kategorii po lewej ── */
  .shop-layout{display:grid;grid-template-columns:220px 1fr;gap:24px;align-items:start}
  @media (max-width: 760px){.shop-layout{grid-template-columns:1fr}}
  .category-sidebar{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;position:sticky;top:78px}
  .category-sidebar-title{padding:12px 14px;font-weight:700;font-size:.9rem;background:#f8fafc;border-bottom:1px solid var(--border)}
  .category-table{width:100%;border-collapse:collapse;font-size:.85rem}
  .category-row{cursor:pointer;transition:background .15s}
  .category-row td{padding:10px 14px;border-bottom:1px solid #f0f0f0}
  .category-row:hover{background:#f8fafc}
  .category-row.active{background:var(--primary-light);font-weight:700;color:var(--primary)}
  .category-row.active td:first-child{border-left:3px solid var(--primary);padding-left:11px}
  .subcategory-row{cursor:pointer;transition:background .15s;background:#fafbfc}
  .subcategory-row td{padding:8px 14px 8px 26px;border-bottom:1px solid #f0f0f0;font-size:.82rem;color:var(--muted)}
  .subcategory-row:hover{background:#f0f2f5}
  .subcategory-row.active{background:#e0f2fe;color:#0369a1;font-weight:600}
  .category-count{text-align:right;color:var(--muted);font-size:.78rem;font-weight:400}
  .category-row.active .category-count{color:var(--primary)}
  .shop-main{min-width:0}

  /* ── Baner reklamowy na stronie głównej sklepu ── */
  .banner-slot{margin-bottom:20px}
  .banner-display{position:relative;border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
  .banner-image{width:100%;max-height:280px;object-fit:cover;display:block}
  .banner-admin-controls{position:absolute;top:10px;right:10px;display:flex;gap:6px}
  .banner-placeholder{border:2.5px dashed #c7d2dd;border-radius:var(--radius);padding:36px 20px;text-align:center;background:#f8fafc;cursor:pointer;transition:all .15s}
  .banner-placeholder:hover{border-color:var(--primary);background:var(--primary-light)}
  .banner-placeholder-icon{font-size:2.2rem;margin-bottom:8px}
  .banner-placeholder-text{font-size:.9rem;color:var(--muted);font-weight:500}
  .banner-edit-card{margin-bottom:0}
  .banner-preview{width:160px;height:90px;border-radius:10px;background:#f8fafc;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .banner-preview img{width:100%;height:100%;object-fit:cover}
  .tab-sub{padding:6px 14px;font-size:.8rem;border-color:#7dd3fc;color:#0369a1}
  .tab-sub:hover{background:#e0f2fe}
  .tab-sub.active{background:#0369a1;color:#fff;border-color:#0369a1;box-shadow:0 2px 8px rgba(3,105,161,.3)}

  .login-tabs{display:flex;gap:4px;background:#ececec;border-radius:10px;padding:4px}
  .login-tab{flex:1;padding:8px 14px;border:none;border-radius:8px;background:transparent;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .15s;color:var(--muted)}
  .login-tab.active{background:#fff;color:var(--primary);box-shadow:var(--shadow)}

  .products-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:20px;margin-top:20px}
  .product-card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid var(--border);overflow:hidden;transition:box-shadow .2s,transform .2s;display:flex;flex-direction:column}
  .product-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);border-color:var(--primary-mid)}
  .product-emoji{font-size:3rem;text-align:center;padding:20px 0 14px;background:#f2fbf7;border-bottom:1px solid #cdeee0;overflow:hidden;transition:opacity .15s}
  .product-emoji.product-link:hover{opacity:.85}
  .product-photo{width:100%;height:120px;object-fit:cover;display:block}
  .product-photo-thumb{width:32px;height:32px;object-fit:cover;border-radius:6px;margin-right:7px;vertical-align:middle}
  .cart-item-photo{width:38px;height:38px;object-fit:cover;border-radius:6px}
  .photo-upload-row{display:flex;gap:14px;align-items:flex-start}
  .photo-preview{width:64px;height:64px;border-radius:10px;background:#f8fafc;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
  .photo-preview img{width:100%;height:100%;object-fit:cover}
  .product-body{padding:12px;flex:1;display:flex;flex-direction:column;gap:7px}
  .product-name{font-weight:600;font-size:.9rem;color:#1c1c1c}
  .product-desc{font-size:.78rem;color:var(--muted);line-height:1.4;flex:1}
  .product-price{font-size:1.15rem;font-weight:700;color:var(--primary)}
  .product-price-original{text-decoration:line-through;color:var(--muted);font-size:.82rem;font-weight:400}
  .product-price-discount{color:var(--success);font-size:.78rem;font-weight:600}
  .promo-badge{display:inline-block;margin-left:8px;background:#dc2626;color:#fff;font-size:.68rem;font-weight:700;padding:2px 7px;border-radius:6px;vertical-align:middle;text-transform:uppercase;letter-spacing:.3px}
  .omnibus-note{color:var(--muted);font-size:.72rem;margin-top:4px;line-height:1.35}
  .attr-group{margin:12px 0}
  .attr-group-label{font-size:.8rem;color:var(--muted);margin-bottom:6px;font-weight:500}
  .attr-tiles{display:flex;flex-wrap:wrap;gap:8px}
  .attr-tile{padding:8px 14px;border:1.5px solid var(--border);border-radius:8px;background:#fff;font-size:.85rem;font-weight:600;cursor:pointer;color:#333;transition:all .12s}
  .attr-tile:hover:not(:disabled){border-color:var(--primary)}
  .attr-tile.active{border-color:var(--primary);background:var(--primary-light);color:var(--primary)}
  .attr-tile:disabled{opacity:.4;cursor:not-allowed;text-decoration:line-through}
  .site-footer{border-top:1px solid var(--border);background:#fff;margin-top:32px}
  .site-footer-inner{max-width:1200px;margin:0 auto;padding:18px 20px;display:flex;flex-wrap:wrap;gap:18px;align-items:center;color:var(--muted);font-size:.85rem}
  .footer-link{background:none;border:none;color:var(--muted);cursor:pointer;font-size:.85rem;padding:0;text-decoration:underline}
  .footer-link:hover{color:var(--primary)}
  .cookie-bar{position:fixed;left:0;right:0;bottom:0;z-index:200;background:#1e293b;color:#e2e8f0;padding:14px 18px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:center;box-shadow:0 -4px 16px rgba(0,0,0,.15)}
  .cookie-bar a{color:#93c5fd;cursor:pointer;text-decoration:underline}
  .stars{display:inline-flex;align-items:center;gap:1px;line-height:1}
  .star{color:#d1d5db;font-size:1rem}
  .star.full{color:#f59e0b}
  .star-btn{background:none;border:none;cursor:pointer;font-size:1.6rem;color:#d1d5db;padding:0 2px;line-height:1}
  .star-btn.on{color:#f59e0b}
  .product-footer{padding:10px 12px;border-top:1px solid var(--border);background:#fafafa}
  .product-sku{font-size:.72rem;color:var(--muted);font-family:monospace}

  .table-wrap{overflow-x:auto}
  table{width:100%;border-collapse:collapse;font-size:.875rem}
  th{background:#e9f8f1;padding:10px 14px;text-align:left;font-weight:600;border-bottom:2px solid #bfe8d4;white-space:nowrap;color:#333}
  td{padding:9px 14px;border-bottom:1px solid var(--border);vertical-align:middle}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:#fff8f5}

  .stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;margin-bottom:22px}
  .stat-card{background:var(--surface);border-radius:var(--radius);padding:16px;box-shadow:var(--shadow);border:1px solid var(--border);border-left:4px solid var(--primary)}
  .stat-value{font-size:1.7rem;font-weight:700;color:var(--primary)}
  .stat-label{font-size:.78rem;color:var(--muted);margin-top:3px}

  .cart-drawer{position:fixed;top:0;right:0;width:370px;height:100vh;background:var(--surface);box-shadow:-4px 0 20px rgba(0,0,0,.15);z-index:200;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .25s ease}
  .cart-drawer.open{transform:translateX(0)}
  .cart-header{padding:18px;border-bottom:2px solid var(--primary);display:flex;justify-content:space-between;align-items:center;background:#e9f8f1}
  .cart-items{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
  .cart-item{display:flex;gap:9px;align-items:center;padding:9px;background:#f2fbf7;border-radius:8px;border:1px solid #cdeee0}
  .cart-item-emoji{font-size:1.8rem}
  .cart-item-info{flex:1;min-width:0}
  .cart-item-name{font-weight:500;font-size:.85rem}
  .cart-item-price{color:var(--primary);font-weight:600;font-size:.82rem}
  .cart-qty{display:flex;align-items:center;gap:5px;margin-top:4px}
  .qty-btn{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--border);background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem}
  .qty-btn:hover{border-color:var(--primary);color:var(--primary)}
  .qty-val{width:28px;text-align:center;font-size:.85rem;font-weight:600}
  .cart-footer{padding:14px;border-top:1px solid var(--border)}
  .cart-total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:.875rem}
  .cart-total-final{font-weight:700;font-size:1.05rem;color:var(--primary);border-top:2px solid var(--border);margin-top:4px;padding-top:9px}
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:150}

  .alert{padding:11px 15px;border-radius:8px;margin-bottom:14px;font-size:.875rem;display:flex;align-items:center;gap:7px}
  .alert-success{background:#e6f4ec;color:#2d8a4e;border:1px solid #b7dfc5}
  .alert-danger{background:#fdecea;color:#c0392b;border:1px solid #f5c6c2}
  .alert-warning{background:#e3f7ef;color:#17956f;border:1px solid #bfe8d4}
  .alert-info{background:#e3f7ef;color:#1cb88a;border:1px solid #bfe8d4}

  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:300;display:flex;align-items:center;justify-content:center;padding:16px}
  .modal{background:#fff;border-radius:var(--radius);width:100%;max-width:560px;box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:90vh;overflow-y:auto;border-top:4px solid var(--primary)}
  .modal-header{padding:18px 22px 0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:#fff;z-index:1;padding-bottom:12px;border-bottom:1px solid var(--border)}
  .modal-body{padding:18px 22px 22px}
  .modal-title{font-size:1.05rem;font-weight:600}
  .close-btn{background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--muted);line-height:1}

  .login-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(145deg,#111722 0%,#1a2030 50%,#111722 100%)}
  .login-card{background:#fff;border-radius:16px;padding:38px;width:100%;max-width:400px;box-shadow:0 25px 60px rgba(0,0,0,.4);border-top:5px solid var(--primary)}
  .login-logo{text-align:center;font-size:2.4rem;margin-bottom:6px}
  .login-title{text-align:center;font-size:1.35rem;font-weight:700;margin-bottom:5px;color:#1c1c1c}
  .login-sub{text-align:center;color:var(--muted);font-size:.85rem;margin-bottom:26px}

  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
  .page-title{font-size:1.35rem;font-weight:700;color:#1c1c1c}
  .search-bar{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center}
  .search-bar .form-input{max-width:260px}
  @media (max-width: 640px) {
    .search-bar{flex-direction:column;align-items:stretch}
    .search-bar .form-input{max-width:none}
    .search-bar .tabs{width:100%}
  }

  .cart-badge{background:var(--primary);color:#fff;border-radius:999px;font-size:.68rem;font-weight:700;min-width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;margin-left:2px;padding:0 4px}
  .tag{display:inline-block;padding:2px 7px;border-radius:4px;font-size:.73rem;font-weight:500;background:#e3f7ef;color:#17956f}
  .tag-sub{background:#e0f2fe;color:#0369a1}
  .tag-subsub{background:#f3e8ff;color:#7c3aed;font-size:.72rem}
  .tag-subsubsub{background:#ffe4e6;color:#be123c;font-size:.68rem}
  .subcat-tree-node{margin-bottom:10px}
  .subcat-children{margin-left:18px;margin-bottom:6px}

  .category-block{border:1px solid var(--border);border-radius:8px;overflow:hidden}
  .category-block-header{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#fafafa;cursor:pointer;transition:background .15s}
  .category-block-header:hover{background:#f0f0f0}
  .category-block-body{padding:12px;border-top:1px solid var(--border);background:#fff}
  .cat-remove-btn{background:none;border:none;cursor:pointer;color:var(--danger);font-weight:700;font-size:.85rem;padding:2px 6px;margin-left:auto;border-radius:4px}
  .cat-remove-btn:hover{background:#fdecea}
  .discount-box{background:linear-gradient(135deg,#e3f7ef,#bfe8d4);border-radius:6px;padding:9px 13px;font-size:.85rem;margin-bottom:9px;border:1px solid #9fdcc0}
  .shipping-info-box{background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:10px 13px;font-size:.85rem;margin-bottom:9px}
  .shipping-progress{height:6px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin-top:6px}
  .shipping-progress-bar{height:100%;background:var(--primary);border-radius:999px;transition:width .3s}

  .csv-dropzone{border:2.5px dashed #7fd1ac;border-radius:12px;padding:40px 20px;text-align:center;background:#f2fbf7;cursor:pointer;transition:all .2s;margin-bottom:20px}
  .csv-dropzone:hover,.csv-dropzone.drag-over{border-color:var(--primary);background:#e3f7ef}
  .csv-dropzone-icon{font-size:2.8rem;margin-bottom:10px}
  .csv-dropzone-text{font-size:1rem;font-weight:600;color:var(--primary);margin-bottom:4px}
  .csv-dropzone-sub{font-size:.82rem;color:var(--muted)}
  .mapping-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px}
  .mapping-row{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f2fbf7;border-radius:8px;border:1px solid #cdeee0}
  .mapping-label{font-size:.82rem;font-weight:600;color:#333;min-width:110px}
  .mapping-arrow{color:var(--primary);font-size:.8rem}
  .preview-table-wrap{overflow-x:auto;max-height:280px;border-radius:8px;border:1px solid var(--border)}
  .preview-table{width:100%;border-collapse:collapse;font-size:.8rem}
  .preview-table th{background:#111722;color:#fff;padding:8px 10px;white-space:nowrap;position:sticky;top:0}
  .preview-table td{padding:7px 10px;border-bottom:1px solid #f5f5f5}
  .preview-table tr:hover td{background:#f2fbf7}
  .row-new{background:#e6f4ec !important}
  .row-update{background:#e3f7ef !important}
  .row-unchanged{background:#fff !important}
  .import-legend{display:flex;gap:14px;font-size:.78rem;margin-bottom:10px;flex-wrap:wrap}
  .legend-dot{width:10px;height:10px;border-radius:50%;display:inline-block;margin-right:4px}
  .sync-bar{background:#111722;color:#fff;padding:8px 14px;border-radius:8px;font-size:.82rem;display:flex;align-items:center;gap:10px;margin-bottom:18px;border-left:4px solid var(--primary)}
  .sync-time{margin-left:auto;color:var(--primary-mid);font-size:.78rem}
  .step-indicator{display:flex;gap:0;margin-bottom:22px}
  .step{flex:1;padding:10px 8px;text-align:center;font-size:.8rem;font-weight:600;border-bottom:3px solid var(--border);color:var(--muted);transition:all .2s}
  .step.active{border-color:var(--primary);color:var(--primary)}
  .step.done{border-color:var(--success);color:var(--success)}
  .csv-format-hint{background:#f2fbf7;border:1px solid #cdeee0;border-radius:8px;padding:14px;font-size:.8rem;font-family:monospace;overflow-x:auto;white-space:pre;margin-bottom:16px;line-height:1.6}
  .changes-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
  .change-card{padding:12px;border-radius:8px;text-align:center}
  .change-card .num{font-size:1.6rem;font-weight:700}
  .change-card .lbl{font-size:.75rem;margin-top:2px}
  .c-new{background:#e6f4ec;color:#2d8a4e}
  .c-upd{background:#e3f7ef;color:#17956f}
  .c-unch{background:#f5f5f5;color:var(--muted)}
  .flex{display:flex}.items-center{align-items:center}.gap-2{gap:8px}.gap-3{gap:12px}
  .mt-2{margin-top:8px}.mt-4{margin-top:16px}.mb-3{margin-bottom:12px}
  .ml-auto{margin-left:auto}.font-bold{font-weight:700}.text-sm{font-size:.875rem}.text-muted{color:var(--muted)}
  .text-right{text-align:right}.text-center{text-align:center}
  .w-full{width:100%}
  .empty-state{text-align:center;padding:44px;color:var(--muted)}
  .empty-state .icon{font-size:2.8rem;margin-bottom:10px}
  .divider{border:none;border-top:1px solid var(--border);margin:16px 0}
  .info-box{background:#f2fbf7;border:1px solid #cdeee0;border-radius:8px;padding:12px 14px;font-size:.83rem;color:#17956f;line-height:1.5}
  .encoding-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px;margin-bottom:18px;font-size:.85rem;color:#92400e}

  /* ── Edytor WYSIWYG ── */
  .rte-wrap{border:1.5px solid var(--border);border-radius:8px;overflow:hidden;background:#fff}
  .rte-toolbar{display:flex;align-items:center;gap:4px;flex-wrap:wrap;padding:8px;background:#f8fafc;border-bottom:1px solid var(--border)}
  .rte-btn{min-width:30px;height:30px;padding:0 7px;border:1.5px solid transparent;border-radius:6px;background:transparent;cursor:pointer;font-size:.85rem;color:#374151;display:inline-flex;align-items:center;justify-content:center}
  .rte-btn:hover{background:#e5e7eb}
  .rte-btn.active{background:var(--primary-light);border-color:var(--primary);color:var(--primary)}
  .rte-sep{width:1px;height:22px;background:var(--border);margin:0 3px}
  .rte-select{height:30px;border:1.5px solid var(--border);border-radius:6px;background:#fff;font-size:.78rem;padding:0 4px;max-width:110px}
  .rte-colors{display:flex;gap:4px;align-items:center}
  .rte-color-dot{width:18px;height:18px;border-radius:50%;border:1.5px solid #fff;box-shadow:0 0 0 1px var(--border);cursor:pointer;padding:0}
  .rte-color-dot:hover{transform:scale(1.15)}
  .rte-editor{min-height:220px;max-height:480px;overflow-y:auto;padding:14px;font-size:.9rem;line-height:1.6;outline:none}
  .rte-editor:empty:before{content:attr(data-placeholder);color:#9ca3af}
  .rte-editor img{max-width:100%;border-radius:6px;margin:6px 0}
  .rte-editor ul,.rte-editor ol{margin-left:22px}

  /* ── Strona szczegółów produktu ── */
  .product-link{color:inherit;text-decoration:none;cursor:pointer}
  .product-link:hover{color:var(--primary);text-decoration:underline}
  .pdp-breadcrumb{font-size:.85rem;color:var(--muted);margin-bottom:16px}
  .pdp-breadcrumb a{color:var(--primary);text-decoration:none;cursor:pointer}
  .pdp-breadcrumb a:hover{text-decoration:underline}
  .pdp-grid{display:grid;grid-template-columns:380px 1fr;gap:32px;align-items:start}
  @media (max-width: 860px){.pdp-grid{grid-template-columns:1fr}}
  .pdp-image-box{background:#f2fbf7;border:1px solid #cdeee0;border-radius:var(--radius);overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:320px}
  .pdp-image-box img{width:100%;height:100%;object-fit:cover}
  .pdp-image-box .emoji-fallback{font-size:6rem}
  .pdp-title{font-size:1.5rem;font-weight:700;margin-bottom:8px}
  .pdp-price{font-size:1.8rem;font-weight:700;color:var(--primary);margin:14px 0}
  .pdp-section-title{font-size:1.1rem;font-weight:700;margin:28px 0 14px;border-bottom:2px solid var(--primary-light);padding-bottom:8px}
  .pdp-rich-content{font-size:.95rem;line-height:1.7;color:#333}
  .pdp-rich-content img{max-width:100%;border-radius:8px;margin:10px 0}
  .specs-table{width:100%;border-collapse:collapse;font-size:.88rem}
  .specs-table tr{border-bottom:1px solid var(--border)}
  .specs-table tr:last-child{border-bottom:none}
  .specs-table td{padding:10px 12px}
  .specs-table td:first-child{font-weight:600;color:#374151;width:40%;background:#f8fafc}
  .spec-row-editor{display:flex;gap:8px;align-items:center;margin-bottom:8px}

  /* ── Strona Kontakt ── */
  .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
  @media (max-width: 760px){.contact-grid{grid-template-columns:1fr}}
  .contact-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:.95rem}
  .contact-row:last-of-type{border-bottom:none}
  .contact-row a{color:var(--primary);text-decoration:none}
  .contact-row a:hover{text-decoration:underline}
  .contact-map{width:100%;height:340px;border:none;display:block}
  .wfmag-badge{background:linear-gradient(90deg,#17956f,#1cb88a);color:#fff;border-radius:6px;padding:3px 9px;font-size:.72rem;font-weight:700;letter-spacing:.5px}

  /* ── Płatności ── */
  .pay-methods{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px}
  .pay-method{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;border:2px solid var(--border);border-radius:10px;background:#fff;cursor:pointer;transition:all .15s}
  .pay-method:hover{border-color:var(--primary-mid)}
  .pay-method.selected{border-color:var(--primary);background:var(--primary-light)}
  .pay-method-icon{font-size:1.8rem}
  .pay-method-label{font-size:.82rem;font-weight:600;color:#333}
  .pay-method-sub{font-size:.7rem;color:var(--muted)}
  .pay-summary{background:#f2fbf7;border:1px solid #cdeee0;border-radius:8px;padding:14px;margin-bottom:18px}
  .pay-summary-row{display:flex;justify-content:space-between;font-size:.9rem;padding:4px 0}
  .pay-summary-total{font-weight:700;font-size:1.1rem;color:var(--primary);border-top:1px solid #cdeee0;margin-top:6px;padding-top:8px}
  .blik-input{display:flex;gap:8px;justify-content:center;margin:16px 0}
  .blik-digit{width:42px;height:50px;text-align:center;font-size:1.3rem;font-weight:700;border:2px solid var(--border);border-radius:8px;outline:none}
  .blik-digit:focus{border-color:var(--primary)}
  .card-field-row{display:flex;gap:10px}
  .pay-processing{text-align:center;padding:30px 10px}
  .pay-spinner{width:48px;height:48px;border:4px solid #cdeee0;border-top-color:var(--primary);border-radius:50%;margin:0 auto 16px;animation:spin 0.8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .pay-success{text-align:center;padding:20px 10px}
  .pay-success-icon{font-size:3.5rem;margin-bottom:10px}
  .secure-badge{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.75rem;color:var(--muted);margin-top:14px}
`


// ── GŁÓWNA APLIKACJA ──────────────────────────────────────────────────────────
export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [omnibusFloors, setOmnibusFloors] = useState({});
  const [productRatings, setProductRatings] = useState({});
  const [units, setUnits] = useState(DEFAULT_UNITS);
  const [categories, setCategories] = useState([
    { name: "Elektronika", subcategories: ["Laptopy", "Audio", "Smartwatche"] },
    { name: "Spożywcze", subcategories: [] },
    { name: "Sport", subcategories: ["Plecaki", "Odzież sportowa"] },
    { name: "Książki", subcategories: [] },
  ]);
  const [dbReady, setDbReady] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    companyName: "TARFIX",
    address: "ul. Przykładowa 1, 00-001 Warszawa",
    phone: "+48 123 456 789",
    email: "kontakt@tarfix.pl",
    hours: "Pon–Pt: 8:00–16:00",
    mapEmbedUrl: "",
    extraNote: "Zapraszamy do kontaktu w sprawie zamówień, reklamacji oraz współpracy.",
  });
  const [bannerInfo, setBannerInfo] = useState({ image: "", link: "", enabled: false });
  const [dbError, setDbError] = useState(null);

  // Wczytanie produktów i kategorii z bazy Supabase przy starcie aplikacji.
  // Jeśli baza nie odpowiada (np. brak konfiguracji), zostają dane startowe
  // z kodu (INITIAL_PRODUCTS) — sklep działa dalej, tylko bez trwałości.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dbProducts, dbCategories] = await Promise.all([
          api.fetchProducts(),
          api.fetchCategories(),
        ]);
        if (cancelled) return;
        // Najniższe ceny z 30 dni (Omnibus) — pobierane osobno, by ewentualny
        // brak widoku product_omnibus nie zablokował ładowania produktów.
        try {
          const floors = await api.fetchOmnibusFloors();
          if (!cancelled) setOmnibusFloors(floors || {});
        } catch (e) {
          console.warn("Nie udało się pobrać najniższych cen z 30 dni (Omnibus):", e.message);
        }
        try {
          const ratings = await api.fetchProductRatings();
          if (!cancelled) setProductRatings(ratings || {});
        } catch (e) {
          console.warn("Nie udało się pobrać ocen produktów:", e.message);
        }
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts.map(p => ({
            id: p.id, sku: p.sku, name: p.name, category: p.category,
            subcategory: p.subcategory || "", description: p.description || "",
            price: Number(p.price), stock: p.stock, weight: Number(p.weight) || 0,
            unit: p.unit || "szt", image: p.image || "📦", photo: p.photo || "",
            longDescription: p.long_description || "", specs: p.specs || [],
            promoPrice: p.promo_price != null ? Number(p.promo_price) : null,
            published: p.published !== false,
            attributeGroups: Array.isArray(p.attribute_groups) ? p.attribute_groups : [],
            variants: Array.isArray(p.variants) ? p.variants.map(v => ({
              id: v.id || String(Math.random()).slice(2),
              combo: v.combo || {},
              price: Number(v.price) || 0,
              sku: v.sku || "",
              weight: Number(v.weight) || 0,
            })) : [],
          })));
        }
        if (dbCategories && dbCategories.length > 0) {
          setCategories(dbCategories.map(c => ({ id: c.id, name: c.name, subcategories: c.subcategories || [] })));
        }
        setDbReady(true);
      } catch (err) {
        console.error("Nie udało się połączyć z bazą danych:", err);
        setDbError(err.message || "Błąd połączenia z bazą danych");
        // Zostajemy na danych startowych z kodu — sklep nadal działa
      }
      // Dane kontaktowe wczytujemy osobno — jeśli tabela "settings" jeszcze
      // nie istnieje w bazie, po prostu zostają domyślne wartości z kodu.
      try {
        const dbContact = await api.fetchContactInfo();
        if (!cancelled && dbContact) setContactInfo(prev => ({ ...prev, ...dbContact }));
      } catch (err) {
        console.warn("Brak zapisanych danych kontaktowych w bazie — używam domyślnych:", err.message);
      }
      // To samo dla banera reklamowego na stronie głównej sklepu.
      try {
        const dbBanner = await api.fetchBannerInfo();
        if (!cancelled && dbBanner) setBannerInfo(prev => ({ ...prev, ...dbBanner }));
      } catch (err) {
        console.warn("Brak zapisanego banera w bazie — używam domyślnych:", err.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const [currentUser, setCurrentUser] = useState({ id: "guest-initial", name: "Gość", email: null, role: "guest", discount: 0 });
  const [recoveryMode, setRecoveryMode] = useState(false);

  // Przywrócenie sesji Supabase przy starcie aplikacji oraz nasłuch zmian
  // logowania (login/logout/odświeżenie tokenu). Jeśli użytkownik był
  // zalogowany, po odświeżeniu strony pozostaje zalogowany. Jeśli nie ma
  // sesji — zostaje tryb gościa.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authUser = await api.getSessionUser();
        if (cancelled) return;
        if (authUser) {
          const appUser = await api.buildAppUser(authUser);
          if (!cancelled && appUser) setCurrentUser(appUser);
        }
      } catch (err) {
        console.warn("Nie udało się przywrócić sesji logowania:", err.message);
      }
    })();

    const unsubscribe = api.onAuthChange(async (authUser, event) => {
      // Powrót z linku resetującego hasło — pokaż ekran ustawienia nowego hasła.
      if (event === "PASSWORD_RECOVERY") { setRecoveryMode(true); return; }
      if (authUser) {
        const appUser = await api.buildAppUser(authUser);
        setCurrentUser(appUser);
      }
      // Wylogowanie obsługujemy jawnie w handleLogout (ustawia tryb gościa),
      // więc tutaj nie zerujemy stanu, by uniknąć migotania ekranu.
    });

    return () => { cancelled = true; unsubscribe && unsubscribe(); };
  }, []);

  const [page, setPage] = useState("shop");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [alert, setAlert] = useState(null);
  const [modal, setModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("Wszystkie");
  const [filterSubcat, setFilterSubcat] = useState("Wszystkie");
  const [lastSync, setLastSync] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isAdmin = currentUser?.role === "admin";
  const isGuest = currentUser?.role === "guest";
  const discount = currentUser?.discount || 0;

  // Wylogowanie: kończy sesję Supabase, czyści koszyk i wraca na ekran logowania.
  const handleLogout = async () => {
    try {
      if (!isGuest) await api.signOut();
    } catch (err) {
      console.warn("Błąd przy wylogowaniu:", err.message);
    }
    setCurrentUser(null);
    setCart([]);
    setPage("shop");
  };

  const openProductDetail = (productId) => {
    setSelectedProductId(productId);
    setPage("product-detail");
  };

  // ── ROUTING: synchronizacja stanu (page/produkt) z adresem URL ──────────────
  const skipPush = useRef(false);
  const KNOWN_PAGES = ["contact", "reklamacje", "terms", "cookies", "account", "orders", "products", "users", "csv", "stats", "quotes"];

  // Stan → URL: po zmianie strony/produktu aktualizuje adres (pushState).
  useEffect(() => {
    if (skipPush.current) { skipPush.current = false; return; }
    let path = "/";
    if (page === "product-detail" && selectedProductId) {
      const p = products.find(x => x.id === selectedProductId);
      path = p ? productPath(p) : `/produkt/${selectedProductId}`;
    } else if (page !== "shop" && KNOWN_PAGES.includes(page)) {
      path = "/" + page;
    }
    if (typeof window !== "undefined" && window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
  }, [page, selectedProductId]);

  // URL → stan: obsługa wstecz/dalej w przeglądarce + odczyt adresu przy starcie.
  useEffect(() => {
    const apply = () => {
      const path = window.location.pathname;
      const pid = parseProductId(path);
      skipPush.current = true; // zmiana pochodzi z URL — nie pushujemy z powrotem
      if (pid) { setSelectedProductId(pid); setPage("product-detail"); }
      else {
        const seg = path.replace(/^\//, "").split("/")[0];
        setPage(KNOWN_PAGES.includes(seg) ? seg : "shop");
      }
    };
    apply();
    window.addEventListener("popstate", apply);
    return () => window.removeEventListener("popstate", apply);
  }, []);

  // Wczytanie zamówień z bazy przy wejściu na panel "Zamówienia"/"Moje zamówienia".
  // Admin widzi wszystkie, klient tylko swoje (RLS). Mapuje pola z bazy
  // (snake_case) na format używany przez interfejs (camelCase). Zastępuje
  // listę sesyjną danymi z bazy, więc widoczne są też historyczne zamówienia.
  useEffect(() => {
    if (page !== "orders" || isGuest || !currentUser?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const dbOrders = await api.fetchOrders(currentUser.id, isAdmin);
        if (cancelled) return;
        const mapped = (dbOrders || []).map(o => ({
          id: o.id,
          date: o.created_at ? new Date(o.created_at).toLocaleDateString("pl-PL") : "",
          user: o.delivery_name || o.guest_email || "Klient",
          userId: o.user_id,
          guestEmail: o.guest_email,
          items: o.items || [],
          subtotal: Number(o.subtotal) || 0,
          discount: o.discount || 0,
          discountAmt: Number(o.discount_amt) || 0,
          shipmentType: o.shipment_type,
          shipmentLabel: o.shipment_label,
          shippingCost: Number(o.shipping_cost) || 0,
          freeShipping: o.free_shipping,
          total: Number(o.total) || 0,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          status: o.status,
          deliveryCompany: o.delivery_company,
          deliveryName: o.delivery_name,
          deliveryPhone: o.delivery_phone,
          deliveryAddress: o.delivery_address,
          deliveryNip: o.delivery_nip,
          paymentTermDays: o.payment_term_days || 0,
        }));
        setOrders(mapped);
      } catch (err) {
        console.warn("Nie udało się wczytać zamówień z bazy:", err.message);
      }
    })();
    return () => { cancelled = true; };
  }, [page, currentUser?.id, isAdmin, isGuest]);

  const addToCart = (p, variant) => {
    // variant = wybrany wariant (z karty/strony produktu) lub brak (produkt bez wariantów).
    // Promocja (Omnibus) dotyczy tylko produktów bez wariantów.
    const isVar = !!variant;
    const promo = hasPromo(p) && !isVar && !hasVariants(p);
    const unitPrice = isVar ? (+variant.price || 0) : effPrice(p);
    const lineId = isVar ? `${p.id}__${variant.id}` : String(p.id);
    const label = isVar && variant.name ? `${p.name} — ${variant.name}` : p.name;
    const item = {
      ...p, id: lineId, productId: p.id, name: label,
      price: unitPrice, regularPrice: isVar ? variant.price : p.price, promoActive: promo,
      weight: isVar ? (+variant.weight || 0) : (p.weight || 0), sku: isVar ? (variant.sku || p.sku) : p.sku,
      optionName: isVar ? (variant.name || "") : "",
    };
    setCart(prev => {
      const ex = prev.find(i => i.id === lineId);
      if (ex) return prev.map(i => i.id === lineId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
    showAlert(`Dodano "${label}" do koszyka`);
  };

  const updateQty = (id, delta) =>
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));

  const cartSub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartDisc = cartSub * (discount / 100);
  const cartAfterDiscount = cartSub - cartDisc;
  const cartWeight = cart.reduce((s, i) => s + (i.weight || 0) * i.qty, 0);
  const shipment = classifyShipment(cart); // { type, label, count, totalWeight, baseCost, packages? }
  const freeShipping = cartAfterDiscount >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = freeShipping ? 0 : shipment.baseCost;
  const cartTotal = cartAfterDiscount + shippingCost;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartAfterDiscount);

  const placeOrder = async (paymentMethod, paymentStatus, guestInfo) => {
    if (!cart.length) return;
    const delivery = guestInfo?.delivery || {};
    const newOrder = {
      id: Date.now(), user: currentUser.name, userId: isGuest ? null : currentUser.id,
      guestEmail: guestInfo?.email || null,
      items: [...cart], subtotal: cartSub, discount, discountAmt: cartDisc,
      shipmentType: shipment.type, shipmentLabel: shipment.label, shippingCost, freeShipping,
      total: cartTotal, date: new Date().toLocaleDateString("pl-PL"),
      status: "Przyjęte", paymentMethod, paymentStatus,
      deliveryCompany: delivery.company || null, deliveryName: delivery.name || null,
      deliveryPhone: delivery.phone || null, deliveryAddress: delivery.address || null,
      deliveryNip: delivery.nip || null,
      paymentTermDays: isGuest ? 0 : (currentUser.paymentTermDays || 0),
    };

    // Zapis zamówienia do bazy danych — jeśli się nie powiedzie, zamówienie
    // wciąż widać lokalnie (na tę sesję), ale informujemy o problemie.
    try {
      await api.createOrder({
        user_id: newOrder.userId,
        guest_email: newOrder.guestEmail,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        discount: newOrder.discount,
        discount_amt: newOrder.discountAmt,
        shipment_type: newOrder.shipmentType,
        shipment_label: newOrder.shipmentLabel,
        shipping_cost: newOrder.shippingCost,
        free_shipping: newOrder.freeShipping,
        total: newOrder.total,
        payment_method: newOrder.paymentMethod,
        payment_status: newOrder.paymentStatus,
        status: newOrder.status,
        delivery_company: newOrder.deliveryCompany,
        delivery_name: newOrder.deliveryName,
        delivery_phone: newOrder.deliveryPhone,
        delivery_address: newOrder.deliveryAddress,
        delivery_nip: newOrder.deliveryNip,
        payment_term_days: newOrder.paymentTermDays,
      });
    } catch (err) {
      console.error("Nie udało się zapisać zamówienia w bazie:", err.message);
    }

    setOrders(prev => [newOrder, ...prev]);
    setCart([]); setCartOpen(false); setPaymentOpen(false);
    showAlert(paymentStatus === "Opłacone" ? "Płatność zaakceptowana — zamówienie złożone!" : "Zamówienie złożone — płatność przy odbiorze!");

    // Automatyczne potwierdzenie e-mailem — wysyłane "w tle", nie blokuje
    // ani nie przerywa procesu składania zamówienia, jeśli się nie powiedzie
    // (np. brak skonfigurowanego Resend) — klient i tak ma już zamówienie.
    const recipientEmail = guestInfo?.email || (currentUser.email || null);
    if (recipientEmail) {
      api.sendOrderConfirmationEmail(newOrder, contactInfo, recipientEmail)
        .then(() => showAlert(`📧 Potwierdzenie wysłane na ${recipientEmail}`, "info"))
        .catch(err => console.warn("Nie udało się wysłać e-maila z potwierdzeniem:", err.message));
    }
  };

  // Do nawigacji sklepu liczą się tylko produkty opublikowane (szkice/bufor pomijamy),
  // żeby nie pokazywać kategorii zawierających wyłącznie produkty z bufora.
  const publishedProducts = products.filter(p => p.published !== false);
  const cats = ["Wszystkie", ...new Set(publishedProducts.map(p => p.category))];
  const filtered = products.filter(p =>
    (p.published !== false) &&
    (filterCat === "Wszystkie" || p.category === filterCat) &&
    (filterSubcat === "Wszystkie" || p.subcategory === filterSubcat) &&
    p.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  if (recoveryMode) return <><style>{css}</style><RecoveryScreen showAlert={showAlert} onDone={() => { setRecoveryMode(false); setCurrentUser(null); }} /></>;
  if (!currentUser) return <><style>{css}</style><LoginPage users={users} setUsers={setUsers} onLogin={setCurrentUser} /></>;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="navbar-brand"><img src={LOGO_TARFIX} alt="TARFIX" style={{ height: 34, verticalAlign: "middle" }} /></div>
            <div className="nav-left">
              <button className={`btn btn-ghost ${page === "shop" ? "active" : ""}`} onClick={() => setPage("shop")}>🏪 Sklep</button>
              <button className={`btn btn-ghost ${page === "contact" ? "active" : ""}`} onClick={() => setPage("contact")}>✉️ Kontakt</button>
              <button className={`btn btn-ghost ${page === "reklamacje" ? "active" : ""}`} onClick={() => setPage("reklamacje")}>🛠️ Reklamacje</button>
              {isAdmin && <>
                <button className={`btn btn-ghost ${page === "csv" ? "active" : ""}`} onClick={() => setPage("csv")}>📥 CSV</button>
                <button className={`btn btn-ghost ${page === "products" ? "active" : ""}`} onClick={() => setPage("products")}>📦 Produkty</button>
                <button className={`btn btn-ghost ${page === "users" ? "active" : ""}`} onClick={() => setPage("users")}>👥 Klienci</button>
                <button className={`btn btn-ghost ${page === "orders" ? "active" : ""}`} onClick={() => setPage("orders")}>📋 Zamówienia</button>
                <button className={`btn btn-ghost ${page === "stats" ? "active" : ""}`} onClick={() => setPage("stats")}>📈 Statystyki</button>
                <button className={`btn btn-ghost ${page === "quotes" ? "active" : ""}`} onClick={() => setPage("quotes")}>📝 Zapytania</button>
              </>}
              {!isAdmin && !isGuest && <button className={`btn btn-ghost ${page === "orders" ? "active" : ""}`} onClick={() => setPage("orders")}>📋 Zamówienia</button>}
            </div>
            <div className="nav-right">
              <button className="btn btn-ghost" onClick={() => setCartOpen(true)} style={{ position: "relative" }}>
                🛒 Koszyk {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
              <span className="text-sm" style={{ color: "#93c5fd", whiteSpace: "nowrap" }}>{isGuest ? "🛍️ Gość" : `👤 ${currentUser.name}`}</span>
              {discount > 0 && <span className="badge badge-green">{discount}%</span>}
              {!isGuest && <button className="btn btn-ghost" style={{ border: "1px solid rgba(255,255,255,.25)", borderRadius: 8 }} onClick={() => setPage("account")}>🔑 Moje konto</button>}
              <button className="btn btn-ghost" style={{ border: "1px solid rgba(255,255,255,.25)", borderRadius: 8 }} onClick={handleLogout}>{isGuest ? "Zaloguj się" : "Wyloguj"}</button>
            </div>
          </div>
        </nav>

        <main className="main">
          {alert && <div className={`alert alert-${alert.type}`}>{alert.type === "success" ? "✅" : alert.type === "warning" ? "⚠️" : alert.type === "info" ? "ℹ️" : "❌"} {alert.msg}</div>}
          {dbError && page !== "shop" && (
            <div className="alert alert-warning">⚠️ Brak połączenia z bazą danych — zmiany nie będą zapisane na trwałe. Szczegóły: {dbError}</div>
          )}

          {isGuest && page === "shop" && (
            <div className="alert alert-info">
              🛍️ Robisz zakupy jako gość — Twoje zamówienie nie będzie zapisane na koncie.{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentUser(null); }} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "underline" }}>Załóż konto</a>, aby zyskać dostęp do historii zamówień i rabatów.
            </div>
          )}

          {lastSync && page !== "csv" && (
            <div className="sync-bar">
              <span>🔄 Ostatnia synchronizacja z WF-Mag:</span>
              <span style={{ color: "#6ee7b7" }}>{lastSync.file}</span>
              <span>— zaimportowano <strong>{lastSync.imported}</strong> produktów</span>
              <span className="sync-time">{lastSync.time}</span>
            </div>
          )}

          {page === "shop" && <ShopPage products={filtered} categories={cats} categoriesFull={categories} filterCat={filterCat} setFilterCat={setFilterCat} filterSubcat={filterSubcat} setFilterSubcat={setFilterSubcat} searchQ={searchQ} setSearchQ={setSearchQ} onAdd={addToCart} discount={discount} units={units} onOpenDetail={openProductDetail} allProducts={publishedProducts} bannerInfo={bannerInfo} setBannerInfo={setBannerInfo} isAdmin={isAdmin} showAlert={showAlert} omnibusFloors={omnibusFloors} productRatings={productRatings} />}
          {page === "product-detail" && <ProductDetailPage product={products.find(p => p.id === selectedProductId)} units={units} discount={discount} onAdd={addToCart} onBack={() => setPage("shop")} omnibusFloors={omnibusFloors} productRatings={productRatings} currentUser={currentUser} isGuest={isGuest} isAdmin={isAdmin} showAlert={showAlert} />}
          {page === "contact" && <ContactPage contactInfo={contactInfo} setContactInfo={setContactInfo} isAdmin={isAdmin} showAlert={showAlert} />}
          {page === "csv" && isAdmin && <CsvImportPage products={products} setProducts={setProducts} units={units} setUnits={setUnits} showAlert={showAlert} setLastSync={setLastSync} />}
          {page === "products" && isAdmin && <AdminProducts products={products} setProducts={setProducts} categories={categories} setCategories={setCategories} units={units} setUnits={setUnits} showAlert={showAlert} modal={modal} setModal={setModal} editItem={editItem} setEditItem={setEditItem} />}
          {page === "users" && isAdmin && <AdminUsers showAlert={showAlert} modal={modal} setModal={setModal} editItem={editItem} setEditItem={setEditItem} currentUser={currentUser} />}
          {page === "orders" && !isGuest && <OrdersPage orders={isAdmin ? orders : orders.filter(o => o.userId === currentUser.id)} setOrders={setOrders} isAdmin={isAdmin} units={units} contactInfo={contactInfo} showAlert={showAlert} />}
          {page === "stats" && isAdmin && <StatsPage currentUser={currentUser} showAlert={showAlert} />}
          {page === "quotes" && isAdmin && <QuoteAdminPage showAlert={showAlert} />}
          {page === "account" && !isGuest && <AccountPage currentUser={currentUser} showAlert={showAlert} />}
          {page === "reklamacje" && <ReklamacjePage currentUser={currentUser} isGuest={isGuest} isAdmin={isAdmin} showAlert={showAlert} />}
          {page === "terms" && <StaticContentPage title="📄 Regulamin sklepu" settingKey="terms_content" isAdmin={isAdmin} showAlert={showAlert} />}
          {page === "cookies" && <StaticContentPage title="🍪 Polityka cookies" settingKey="cookies_content" isAdmin={isAdmin} showAlert={showAlert} />}
        </main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <span>© {new Date().getFullYear()} TARFIX</span>
            <button className="footer-link" onClick={() => setPage("terms")}>Regulamin</button>
            <button className="footer-link" onClick={() => setPage("cookies")}>Polityka cookies</button>
            <button className="footer-link" onClick={() => setPage("reklamacje")}>Reklamacje</button>
            <button className="footer-link" onClick={() => setPage("contact")}>Kontakt</button>
          </div>
        </footer>
      </div>

      {cartOpen && <div className="overlay" onClick={() => setCartOpen(false)} />}
      <CookieConsent onOpenPolicy={() => setPage("cookies")} />
      <div className={`cart-drawer ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2 className="card-title" style={{ margin: 0 }}>🛒 Koszyk ({cartCount})</h2>
          <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? <div className="empty-state"><div className="icon">🛒</div>Koszyk jest pusty</div>
            : cart.map(item => (
              <div key={item.id} className="cart-item">
                <span className="cart-item-emoji">{item.photo ? <img src={item.photo} alt={item.name} className="cart-item-photo" /> : item.image}</span>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{fmt(item.price)} / szt.</div>
                  <div className="cart-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                    <span className="qty-val">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="font-bold" style={{ color: "var(--primary)", fontSize: ".9rem" }}>{fmt(item.price * item.qty)}</div>
                </div>
              </div>
            ))}
        </div>
        <div className="cart-footer">
          {cart.length > 0 && (
            <div className="shipping-info-box">
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <span>{shipment.type === "packages" ? "📦" : "🪵"} {shipment.label}</span>
                <span className="text-muted">· {cartWeight.toFixed(1)} kg łącznie</span>
              </div>
              {freeShipping
                ? <div className="text-sm" style={{ color: "var(--success)", fontWeight: 600 }}>🚚 Darmowa dostawa!</div>
                : <>
                  <div className="text-sm text-muted">Brakuje {fmt(amountToFreeShipping)} do darmowej dostawy</div>
                  <div className="shipping-progress"><div className="shipping-progress-bar" style={{ width: `${Math.min(100, (cartAfterDiscount / FREE_SHIPPING_THRESHOLD) * 100)}%` }}></div></div>
                </>}
            </div>
          )}
          {discount > 0 && <div className="discount-box">🎉 Rabat {discount}% — oszczędzasz {fmt(cartDisc)}</div>}
          <div className="cart-total-row"><span>Suma:</span><span>{fmt(cartSub)}</span></div>
          {discount > 0 && <div className="cart-total-row" style={{ color: "var(--success)" }}><span>Rabat ({discount}%):</span><span>−{fmt(cartDisc)}</span></div>}
          <div className="cart-total-row">
            <span>Dostawa ({shipment.label}):</span>
            <span>{freeShipping ? <span style={{ color: "var(--success)", fontWeight: 600 }}>Gratis</span> : fmt(shippingCost)}</span>
          </div>
          <div className="cart-total-row cart-total-final"><span>Do zapłaty:</span><span>{fmt(cartTotal)}</span></div>
          <div className="cart-total-row text-sm text-muted"><span>w tym netto:</span><span>{fmt(netOf(cartTotal))}</span></div>
          <div className="cart-total-row text-sm text-muted"><span>w tym VAT 23%:</span><span>{fmt(cartTotal - netOf(cartTotal))}</span></div>
          <button className="btn btn-success w-full" style={{ marginTop: 10 }} onClick={() => setPaymentOpen(true)} disabled={!cart.length}>💳 Przejdź do płatności</button>
        </div>
      </div>

      {paymentOpen && (
        <PaymentModal
          total={cartTotal}
          subtotal={cartAfterDiscount}
          shippingCost={shippingCost}
          freeShipping={freeShipping}
          shipmentLabel={shipment.label}
          isGuest={isGuest}
          onClose={() => setPaymentOpen(false)}
          onComplete={placeOrder}
        />
      )}
    </>
  );
}

// ── ODZYSKIWANIE HASŁA: ustawienie nowego hasła po kliknięciu linku z e-maila ─
function RecoveryScreen({ showAlert, onDone }) {
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setErr("");
    if (!pass1 || !pass2) return setErr("Wypełnij oba pola.");
    if (pass1.length < 6) return setErr("Hasło musi mieć min. 6 znaków.");
    if (pass1 !== pass2) return setErr("Hasła nie są identyczne.");
    setLoading(true);
    try {
      await api.changePassword(pass1);
      setDone(true);
      showAlert("Hasło zostało zmienione. Możesz się zalogować.", "success");
    } catch (e) {
      const msg = e?.message || "";
      if (/should be different|same.*password/i.test(msg)) setErr("Nowe hasło musi różnić się od poprzedniego.");
      else if (/session|not authenticated|jwt|expired/i.test(msg)) setErr("Link wygasł lub jest nieprawidłowy. Poproś o nowy link na ekranie logowania.");
      else setErr("Nie udało się zmienić hasła: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-title"><img src={LOGO_TARFIX} alt="TARFIX" style={{ height: 42, margin: "0 auto", display: "block" }} /></div>
        <div className="login-sub">Ustaw nowe hasło</div>
        {done ? (
          <>
            <div className="alert alert-success">✅ Hasło zostało zmienione.</div>
            <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={onDone}>Przejdź do logowania →</button>
          </>
        ) : (
          <>
            {err && <div className="alert alert-danger">❌ {err}</div>}
            <div className="form-group"><label className="form-label">Nowe hasło</label>
              <input className="form-input" type="password" value={pass1} onChange={e => setPass1(e.target.value)} placeholder="min. 6 znaków" /></div>
            <div className="form-group"><label className="form-label">Powtórz nowe hasło</label>
              <input className="form-input" type="password" value={pass2} onChange={e => setPass2(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="••••••••" /></div>
            <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={submit} disabled={loading}>{loading ? "Zapisywanie…" : "Zapisz nowe hasło"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── LOGOWANIE ─────────────────────────────────────────────────────────────────
function LoginPage({ users, setUsers, onLogin }) {
  const [tab, setTab] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetInfo, setResetInfo] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regPass2, setRegPass2] = useState("");
  const [regErr, setRegErr] = useState("");
  const [regInfo, setRegInfo] = useState("");

  const handleLogin = async () => {
    setErr("");
    if (!email.trim() || !password) return setErr("Podaj e-mail i hasło.");
    setLoading(true);
    try {
      const { user } = await api.signIn(email.trim(), password);
      const appUser = await api.buildAppUser(user);
      onLogin(appUser);
    } catch (e) {
      const msg = e?.message || "";
      if (/invalid login credentials/i.test(msg)) setErr("Nieprawidłowy e-mail lub hasło.");
      else if (/email not confirmed/i.test(msg)) setErr("Konto nie zostało potwierdzone. Sprawdź e-mail z linkiem aktywacyjnym.");
      else setErr("Błąd logowania: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setRegErr(""); setRegInfo("");
    if (!regName.trim() || !regEmail.trim() || !regPass) return setRegErr("Wypełnij wszystkie pola.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) return setRegErr("Podaj poprawny adres e-mail.");
    if (regPass.length < 6) return setRegErr("Hasło musi mieć min. 6 znaków.");
    if (regPass !== regPass2) return setRegErr("Hasła nie są identyczne.");
    setLoading(true);
    try {
      const { user, session } = await api.signUp(regName.trim(), regEmail.trim(), regPass);
      if (session) {
        // Potwierdzanie e-maila wyłączone — użytkownik od razu zalogowany.
        const appUser = await api.buildAppUser(user);
        onLogin(appUser);
      } else {
        // Potwierdzanie e-maila włączone — trzeba kliknąć link aktywacyjny.
        setRegInfo("Konto utworzone. Sprawdź e-mail i kliknij link aktywacyjny, aby się zalogować.");
        setTab("login");
      }
    } catch (e) {
      const msg = e?.message || "";
      if (/already registered|user already exists/i.test(msg)) setRegErr("Konto z tym adresem e-mail już istnieje.");
      else setRegErr("Błąd rejestracji: " + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    onLogin({ id: "guest-" + Date.now(), name: "Gość", email: null, role: "guest", discount: 0 });
  };

  const handleReset = async () => {
    setErr(""); setResetInfo("");
    if (!email.trim()) return setErr("Podaj adres e-mail konta.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Podaj poprawny adres e-mail.");
    setLoading(true);
    try {
      await api.sendPasswordReset(email.trim());
      setResetInfo("Jeśli konto o tym adresie istnieje, wysłaliśmy link do zresetowania hasła. Sprawdź skrzynkę (także folder spam).");
    } catch (e) {
      setErr("Nie udało się wysłać linku: " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-title"><img src={LOGO_TARFIX} alt="TARFIX" style={{ height: 42, margin: "0 auto", display: "block" }} /></div>
        <div className="login-sub">{tab === "login" ? "Zaloguj się do swojego konta" : "Załóż nowe konto"}</div>

        <div className="login-tabs" style={{ marginBottom: 18 }}>
          <button className={`login-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setErr(""); }}>Logowanie</button>
          <button className={`login-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setRegErr(""); }}>Nowe konto</button>
        </div>

        {tab === "login" && resetMode && (
          <>
            <div className="login-sub" style={{ marginTop: -6, marginBottom: 14 }}>Podaj e-mail konta — wyślemy link do ustawienia nowego hasła.</div>
            {err && <div className="alert alert-danger">❌ {err}</div>}
            {resetInfo && <div className="alert alert-info">ℹ️ {resetInfo}</div>}
            <div className="form-group"><label className="form-label">E-mail</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReset()} placeholder="jan@example.com" /></div>
            <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={handleReset} disabled={loading}>{loading ? "Wysyłanie…" : "📨 Wyślij link resetujący"}</button>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setResetMode(false); setErr(""); setResetInfo(""); }} style={{ color: "var(--primary)", fontSize: ".9rem" }}>← Wróć do logowania</a>
            </div>
          </>
        )}

        {tab === "login" && !resetMode && (
          <>
            {err && <div className="alert alert-danger">❌ {err}</div>}
            {regInfo && <div className="alert alert-info">ℹ️ {regInfo}</div>}
            {resetInfo && <div className="alert alert-info">ℹ️ {resetInfo}</div>}
            <div className="form-group"><label className="form-label">E-mail</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jan@example.com" /></div>
            <div className="form-group"><label className="form-label">Hasło</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" /></div>
            <div style={{ textAlign: "right", marginTop: -6, marginBottom: 10 }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setResetMode(true); setErr(""); setResetInfo(""); }} style={{ color: "var(--primary)", fontSize: ".85rem" }}>Nie pamiętasz hasła?</a>
            </div>
            <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={handleLogin} disabled={loading}>{loading ? "Logowanie…" : "Zaloguj się →"}</button>

            <div className="flex items-center gap-2 mt-4" style={{ margin: "18px 0" }}>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
              <span className="text-sm text-muted">lub</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }}></div>
            </div>
            <button className="btn btn-secondary w-full" onClick={handleGuest} disabled={loading}>🛍️ Kontynuuj jako gość</button>
          </>
        )}

        {tab === "register" && (
          <>
            {regErr && <div className="alert alert-danger">❌ {regErr}</div>}
            <div className="form-group"><label className="form-label">Imię i nazwisko</label>
              <input className="form-input" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jan Kowalski" /></div>
            <div className="form-group"><label className="form-label">E-mail</label>
              <input className="form-input" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="jan@example.com" /></div>
            <div className="form-group"><label className="form-label">Hasło</label>
              <input className="form-input" type="password" value={regPass} onChange={e => setRegPass(e.target.value)} placeholder="min. 6 znaków" /></div>
            <div className="form-group"><label className="form-label">Powtórz hasło</label>
              <input className="form-input" type="password" value={regPass2} onChange={e => setRegPass2(e.target.value)} onKeyDown={e => e.key === "Enter" && handleRegister()} placeholder="••••••••" /></div>
            <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={handleRegister} disabled={loading}>{loading ? "Tworzenie konta…" : "Załóż konto →"}</button>
            <p className="text-sm text-muted text-center mt-2" style={{ marginTop: 10 }}>Zakładając konto otrzymasz dostęp do historii zamówień i przyszłych rabatów.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── MOJE KONTO / ZMIANA HASŁA ─────────────────────────────────────────────────
function AccountPage({ currentUser, showAlert }) {
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Dane firmy
  const [company, setCompany] = useState({ companyName: "", nip: "", companyAddress: "", phone: "", contactName: "" });
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companySaving, setCompanySaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await api.getProfile(currentUser.id);
        if (!cancelled && p) setCompany({
          companyName: p.company_name || "", nip: p.nip || "", companyAddress: p.company_address || "",
          phone: p.phone || "", contactName: p.contact_name || "",
        });
      } catch (e) {
        // brak danych / brak profilu — zostają puste pola
      } finally {
        if (!cancelled) setCompanyLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUser.id]);

  const saveCompany = async () => {
    setCompanySaving(true);
    try {
      await api.updateMyCompany(company);
      showAlert("Dane firmy zapisane.", "success");
    } catch (e) {
      showAlert("Nie udało się zapisać danych firmy: " + (e?.message || ""), "danger");
    } finally {
      setCompanySaving(false);
    }
  };

  const handleChange = async () => {
    setErr("");
    if (!pass1 || !pass2) return setErr("Wypełnij oba pola.");
    if (pass1.length < 6) return setErr("Nowe hasło musi mieć min. 6 znaków.");
    if (pass1 !== pass2) return setErr("Hasła nie są identyczne.");
    setLoading(true);
    try {
      await api.changePassword(pass1);
      setPass1(""); setPass2("");
      showAlert("Hasło zostało zmienione.", "success");
    } catch (e) {
      const msg = e?.message || "";
      if (/should be different|same.*password/i.test(msg)) setErr("Nowe hasło musi różnić się od poprzedniego.");
      else if (/session|not authenticated|jwt/i.test(msg)) setErr("Sesja wygasła. Zaloguj się ponownie i spróbuj jeszcze raz.");
      else setErr("Nie udało się zmienić hasła: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{ marginTop: 0, fontSize: "1.3rem" }}>🔑 Moje konto</h2>
        <p className="text-sm text-muted" style={{ marginBottom: 20 }}>
          Zalogowano jako <strong>{currentUser?.name}</strong>{currentUser?.email ? ` (${currentUser.email})` : ""}.
        </p>

        <h3 style={{ fontSize: "1.05rem", marginBottom: 14 }}>🏢 Dane firmy</h3>
        <p className="text-sm text-muted" style={{ marginTop: -6, marginBottom: 14 }}>Zapisane dane możesz wykorzystać przy zamówieniach (faktura, dostawa).</p>
        {companyLoading
          ? <p className="text-sm text-muted">Wczytywanie…</p>
          : <>
              <div className="form-group"><label className="form-label">Nazwa firmy</label>
                <input className="form-input" value={company.companyName} onChange={e => setCompany(c => ({ ...c, companyName: e.target.value }))} placeholder="np. MK Technika Zamocowań" /></div>
              <div className="form-group"><label className="form-label">NIP</label>
                <input className="form-input" value={company.nip} onChange={e => setCompany(c => ({ ...c, nip: e.target.value }))} placeholder="np. 1234567890" /></div>
              <div className="form-group"><label className="form-label">Adres firmy</label>
                <input className="form-input" value={company.companyAddress} onChange={e => setCompany(c => ({ ...c, companyAddress: e.target.value }))} placeholder="ulica, nr, kod, miejscowość" /></div>
              <div className="form-group"><label className="form-label">Osoba kontaktowa</label>
                <input className="form-input" value={company.contactName} onChange={e => setCompany(c => ({ ...c, contactName: e.target.value }))} placeholder="Imię i nazwisko" /></div>
              <div className="form-group"><label className="form-label">Telefon</label>
                <input className="form-input" type="tel" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} placeholder="np. 600 100 200" /></div>
              <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={saveCompany} disabled={companySaving}>{companySaving ? "Zapisywanie…" : "💾 Zapisz dane firmy"}</button>
            </>}

        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "24px 0" }} />

        <h3 style={{ fontSize: "1.05rem", marginBottom: 14 }}>Zmiana hasła</h3>
        {err && <div className="alert alert-danger">❌ {err}</div>}
        <div className="form-group"><label className="form-label">Nowe hasło</label>
          <input className="form-input" type="password" value={pass1} onChange={e => setPass1(e.target.value)} placeholder="min. 6 znaków" /></div>
        <div className="form-group"><label className="form-label">Powtórz nowe hasło</label>
          <input className="form-input" type="password" value={pass2} onChange={e => setPass2(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChange()} placeholder="••••••••" /></div>
        <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={handleChange} disabled={loading}>{loading ? "Zapisywanie…" : "Zmień hasło"}</button>
      </div>
    </div>
  );
}

// ── PASEK ZGODY NA COOKIES ──────────────────────────────────────────────────
function CookieConsent({ onOpenPolicy }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("tarfix_cookies_ok")) setVisible(true); }
    catch { setVisible(true); }
  }, []);
  if (!visible) return null;
  const accept = () => {
    try { localStorage.setItem("tarfix_cookies_ok", "1"); } catch {}
    setVisible(false);
  };
  return (
    <div className="cookie-bar">
      <span style={{ maxWidth: 720 }}>
        🍪 Ten serwis używa plików cookies, aby zapewnić prawidłowe działanie sklepu i poprawić jakość usług.{" "}
        <a onClick={onOpenPolicy}>Polityka cookies</a>.
      </span>
      <button className="btn btn-primary btn-sm" onClick={accept}>Akceptuję</button>
    </div>
  );
}

// ── STRONA TREŚCI PRAWNEJ (regulamin / cookies) — edytowalna przez admina ───
function StaticContentPage({ title, settingKey, isAdmin, showAlert }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const v = await api.fetchSetting(settingKey);
        if (!cancelled) setContent(typeof v === "string" ? v : (v == null ? "" : String(v)));
      } catch (e) {
        if (!cancelled) setContent("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [settingKey]);

  const startEdit = () => { setDraft(content); setEditing(true); };
  const save = async () => {
    setSaving(true);
    try {
      await api.saveSetting(settingKey, draft);
      setContent(draft); setEditing(false);
      showAlert("Treść zapisana.", "success");
    } catch (e) {
      showAlert("Nie udało się zapisać: " + (e?.message || ""), "danger");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="page-header" style={{ alignItems: "center" }}>
        <h1 className="page-title">{title}</h1>
        {isAdmin && !editing && <button className="btn btn-secondary btn-sm" onClick={startEdit}>✏️ Edytuj</button>}
      </div>
      <div className="card" style={{ padding: 24 }}>
        {loading ? <p className="text-muted">Wczytywanie…</p>
          : editing ? <>
              <textarea className="form-input" style={{ minHeight: 360, fontFamily: "inherit", lineHeight: 1.6 }} value={draft} onChange={e => setDraft(e.target.value)} />
              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Zapisywanie…" : "💾 Zapisz"}</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Anuluj</button>
              </div>
            </>
          : content ? <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{content}</div>
          : <p className="text-muted">Treść nie została jeszcze uzupełniona.{isAdmin ? " Kliknij „Edytuj”, aby ją dodać." : ""}</p>}
      </div>
    </div>
  );
}

// ── REKLAMACJE: formularz + (dla admina) lista zgłoszeń ─────────────────────
const COMPLAINT_STATUSES = ["Nowa", "W trakcie", "Rozpatrzona", "Odrzucona"];
function ReklamacjePage({ currentUser, isGuest, isAdmin, showAlert }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", orderNumber: "", product: "", reason: "Wada produktu", description: "" });
  const [sending, setSending] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(isAdmin);

  useEffect(() => {
    if (!isGuest && currentUser) setForm(f => ({ ...f, name: f.name || currentUser.name || "", email: f.email || currentUser.email || "" }));
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try { const data = await api.fetchComplaints(); if (!cancelled) setComplaints(data || []); }
      catch (e) { if (!cancelled) showAlert("Nie udało się wczytać reklamacji: " + e.message, "danger"); }
      finally { if (!cancelled) setLoadingList(false); }
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.description.trim())
      return showAlert("Uzupełnij imię, e-mail i opis problemu.", "danger");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return showAlert("Podaj poprawny adres e-mail.", "danger");
    setSending(true);
    try {
      await api.createComplaint({
        user_id: isGuest ? null : currentUser?.id || null,
        order_number: form.orderNumber || null, name: form.name, email: form.email,
        phone: form.phone || null, product: form.product || null, reason: form.reason, description: form.description,
      });
      showAlert("Reklamacja została wysłana. Odpowiemy najszybciej, jak to możliwe.", "success");
      setForm(f => ({ ...f, orderNumber: "", product: "", description: "" }));
    } catch (e) {
      showAlert("Nie udało się wysłać reklamacji: " + (e?.message || ""), "danger");
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.updateComplaintStatus(id, status);
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      showAlert("Status reklamacji zaktualizowany.");
    } catch (e) { showAlert("Nie udało się zmienić statusu: " + e.message, "danger"); }
  };

  return (
    <div style={{ maxWidth: isAdmin ? 1000 : 640, margin: "0 auto" }}>
      <div className="page-header"><h1 className="page-title">🛠️ Reklamacje</h1></div>

      {isAdmin ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Zgłoszenia reklamacyjne</h3>
          {loadingList ? <p className="text-muted">Wczytywanie…</p>
            : complaints.length === 0 ? <div className="empty-state"><div className="icon">🛠️</div>Brak reklamacji</div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Data</th><th>Klient</th><th>Zamówienie</th><th>Produkt</th><th>Powód</th><th>Opis</th><th>Status</th></tr></thead>
                <tbody>{complaints.map(c => (
                  <tr key={c.id}>
                    <td className="text-sm text-muted">{new Date(c.created_at).toLocaleDateString("pl-PL")}</td>
                    <td><strong>{c.name}</strong><div className="text-sm text-muted">{c.email}{c.phone ? ` · ${c.phone}` : ""}</div></td>
                    <td>{c.order_number || "—"}</td>
                    <td>{c.product || "—"}</td>
                    <td>{c.reason || "—"}</td>
                    <td style={{ maxWidth: 240, whiteSpace: "pre-wrap" }}>{c.description}</td>
                    <td><select className="form-select" style={{ padding: "5px 8px" }} value={c.status} onChange={e => changeStatus(c.id, e.target.value)}>{COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                  </tr>
                ))}</tbody>
              </table></div>}
        </div>
      ) : (
        <div className="card" style={{ padding: 24 }}>
          <p className="text-muted" style={{ marginTop: 0 }}>Wypełnij formularz, aby zgłosić reklamację. Pola oznaczone * są wymagane.</p>
          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Imię i nazwisko *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">E-mail *</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Telefon</label><input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Numer zamówienia</label><input className="form-input" value={form.orderNumber} onChange={e => setForm(f => ({ ...f, orderNumber: e.target.value }))} placeholder="np. #123456" /></div>
          </div>
          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Produkt</label><input className="form-input" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} placeholder="nazwa lub SKU" /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Powód reklamacji</label>
              <select className="form-select" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                <option>Wada produktu</option><option>Uszkodzenie w transporcie</option><option>Niezgodność z zamówieniem</option><option>Braki w dostawie</option><option>Inny</option>
              </select></div>
          </div>
          <div className="form-group"><label className="form-label">Opis problemu *</label><textarea className="form-input" style={{ minHeight: 120 }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Opisz, na czym polega problem…" /></div>
          <button className="btn btn-primary w-full" style={{ padding: "11px" }} onClick={submit} disabled={sending}>{sending ? "Wysyłanie…" : "📨 Wyślij reklamację"}</button>
        </div>
      )}
    </div>
  );
}

// ── PŁATNOŚĆ ──────────────────────────────────────────────────────────────────
// ── EDYTOR WYSIWYG (własny, lekki, bez zewnętrznych zależności) ──────────────
function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [activeFormats, setActiveFormats] = useState({});
  const savedSelection = useRef(null);

  // Synchronizuje DOM z value tylko gdy zmiana przychodzi z zewnątrz (np. przy edycji innego produktu)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (cmd, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    onChange(editorRef.current?.innerHTML || "");
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      justifyRight: document.queryCommandState("justifyRight"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
    });
  };

  const handleInput = () => onChange(editorRef.current?.innerHTML || "");

  const handleColor = (color) => exec("foreColor", color);

  const handleFontSize = (size) => {
    // execCommand fontSize tylko obsługuje 1-7, mapujemy na realne px przez span
    editorRef.current?.focus();
    document.execCommand("fontSize", false, "7");
    const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
    fontElements.forEach(el => {
      el.removeAttribute("size");
      el.style.fontSize = size;
    });
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleFontFamily = (font) => exec("fontName", font);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) { alert("Obraz jest większy niż 3 MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      editorRef.current?.focus();
      document.execCommand("insertImage", false, reader.result);
      onChange(editorRef.current?.innerHTML || "");
    };
    reader.readAsDataURL(file);
  };

  const colors = ["#1c1c1c", "#dc2626", "#e85d04", "#ca8a04", "#16a34a", "#1cb88a", "#0369a1", "#7c3aed"];
  const fonts = [
    { value: "Inter, sans-serif", label: "Inter (domyślna)" },
    { value: "Georgia, serif", label: "Georgia" },
    { value: "'Courier New', monospace", label: "Courier" },
    { value: "Verdana, sans-serif", label: "Verdana" },
    { value: "'Times New Roman', serif", label: "Times New Roman" },
  ];
  const sizes = [
    { value: "13px", label: "Mały" },
    { value: "16px", label: "Normalny" },
    { value: "20px", label: "Duży" },
    { value: "28px", label: "Bardzo duży" },
  ];

  return (
    <div className="rte-wrap">
      <div className="rte-toolbar">
        <button type="button" className={`rte-btn ${activeFormats.bold ? "active" : ""}`} onClick={() => exec("bold")} title="Pogrubienie"><strong>B</strong></button>
        <button type="button" className={`rte-btn ${activeFormats.italic ? "active" : ""}`} onClick={() => exec("italic")} title="Kursywa"><em>I</em></button>
        <button type="button" className={`rte-btn ${activeFormats.underline ? "active" : ""}`} onClick={() => exec("underline")} title="Podkreślenie"><u>U</u></button>
        <span className="rte-sep"></span>
        <select className="rte-select" onChange={e => handleFontFamily(e.target.value)} defaultValue="" title="Czcionka">
          <option value="" disabled>Czcionka</option>
          {fonts.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
        </select>
        <select className="rte-select" onChange={e => handleFontSize(e.target.value)} defaultValue="" title="Rozmiar tekstu">
          <option value="" disabled>Rozmiar</option>
          {sizes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="rte-sep"></span>
        <div className="rte-colors">
          {colors.map(c => <button type="button" key={c} className="rte-color-dot" style={{ background: c }} onClick={() => handleColor(c)} title={`Kolor tekstu: ${c}`} />)}
        </div>
        <span className="rte-sep"></span>
        <button type="button" className={`rte-btn ${activeFormats.justifyLeft ? "active" : ""}`} onClick={() => exec("justifyLeft")} title="Do lewej">⬅</button>
        <button type="button" className={`rte-btn ${activeFormats.justifyCenter ? "active" : ""}`} onClick={() => exec("justifyCenter")} title="Do środka">↔</button>
        <button type="button" className={`rte-btn ${activeFormats.justifyRight ? "active" : ""}`} onClick={() => exec("justifyRight")} title="Do prawej">➡</button>
        <span className="rte-sep"></span>
        <button type="button" className={`rte-btn ${activeFormats.insertUnorderedList ? "active" : ""}`} onClick={() => exec("insertUnorderedList")} title="Lista punktowana">• ‒</button>
        <button type="button" className={`rte-btn ${activeFormats.insertOrderedList ? "active" : ""}`} onClick={() => exec("insertOrderedList")} title="Lista numerowana">1.</button>
        <span className="rte-sep"></span>
        <button type="button" className="rte-btn" onClick={() => fileRef.current?.click()} title="Wstaw obraz">🖼️</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
        <button type="button" className="rte-btn" onClick={() => exec("removeFormat")} title="Wyczyść formatowanie">✕</button>
      </div>
      <div
        ref={editorRef}
        className="rte-editor"
        contentEditable
        onInput={handleInput}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        data-placeholder={placeholder || "Wpisz rozszerzony opis produktu..."}
        suppressContentEditableWarning
      />
    </div>
  );
}


function PaymentModal({ total, subtotal, shippingCost, freeShipping, shipmentLabel, isGuest, onClose, onComplete }) {
  const [method, setMethod] = useState("card");
  const [stage, setStage] = useState("select"); // select | form | processing | success
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [blik, setBlik] = useState(["", "", "", "", "", ""]);
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailErr, setGuestEmailErr] = useState("");
  const [delivery, setDelivery] = useState({ company: "", name: "", phone: "", address: "", nip: "" });
  const [deliveryErr, setDeliveryErr] = useState("");
  const blikRefs = useRef([]);

  const methods = [
    { id: "card", icon: "💳", label: "Karta płatnicza", sub: "Visa, Mastercard" },
    { id: "blik", icon: "📱", label: "BLIK", sub: "Kod z aplikacji banku" },
    { id: "transfer", icon: "🏦", label: "Przelew online", sub: "Szybki przelew" },
    { id: "cod", icon: "📦", label: "Za pobraniem", sub: "Płatność przy odbiorze" },
  ];

  const formatCardNumber = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  const formatExpiry = (v) => v.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(?=\d)/, "$1/");

  const handleBlikChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...blik]; next[i] = val; setBlik(next);
    if (val && i < 5) blikRefs.current[i + 1]?.focus();
  };

  const guestEmailValid = !isGuest || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
  const deliveryValid = delivery.name.trim() && delivery.phone.trim() && delivery.address.trim();

  const canSubmit = () => {
    if (!guestEmailValid) return false;
    if (!deliveryValid) return false;
    if (method === "cod") return true;
    if (method === "blik") return blik.every(d => d !== "");
    if (method === "card") return card.number.replace(/\s/g, "").length === 16 && card.expiry.length === 5 && card.cvc.length >= 3 && card.name.trim();
    if (method === "transfer") return true;
    return false;
  };

  const submit = () => {
    if (isGuest && !guestEmailValid) { setGuestEmailErr("Podaj poprawny adres e-mail."); return; }
    if (!deliveryValid) { setDeliveryErr("Uzupełnij dane do dostawy: osoba kontaktowa, telefon i adres."); return; }
    const info = { email: isGuest ? guestEmail : null, delivery };
    if (method === "cod") return onComplete("Za pobraniem", "Do zapłaty przy odbiorze", info);
    setStage("processing");
    setTimeout(() => {
      setStage("success");
      setTimeout(() => {
        const labelMap = { card: "Karta płatnicza", blik: "BLIK", transfer: "Przelew online" };
        onComplete(labelMap[method], "Opłacone", info);
      }, 1200);
    }, 1800);
  };

  return (
    <div className="modal-bg">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">💳 Płatność</h2>
          {stage !== "processing" && <button className="close-btn" onClick={onClose}>✕</button>}
        </div>
        <div className="modal-body">

          {stage === "processing" && (
            <div className="pay-processing">
              <div className="pay-spinner"></div>
              <p className="font-bold">Przetwarzanie płatności...</p>
              <p className="text-sm text-muted mt-2">Nie zamykaj tego okna</p>
            </div>
          )}

          {stage === "success" && (
            <div className="pay-success">
              <div className="pay-success-icon">✅</div>
              <p className="font-bold" style={{ fontSize: "1.1rem" }}>Płatność zaakceptowana!</p>
              <p className="text-sm text-muted mt-2">Kwota: {fmt(total)}</p>
            </div>
          )}

          {(stage === "select" || stage === "form") && (
            <>
              <div className="pay-summary">
                <div className="pay-summary-row"><span>Wartość produktów:</span><span>{fmt(subtotal)}</span></div>
                <div className="pay-summary-row"><span>Dostawa ({shipmentLabel}):</span><span>{freeShipping ? <span style={{ color: "var(--success)", fontWeight: 600 }}>Gratis</span> : fmt(shippingCost)}</span></div>
                <div className="pay-summary-row pay-summary-total"><span>Razem</span><span>{fmt(total)}</span></div>
              </div>

              {isGuest && (
                <div className="form-group">
                  <label className="form-label">E-mail do potwierdzenia zamówienia *</label>
                  <input className="form-input" type="email" placeholder="twoj@email.pl" value={guestEmail}
                    onChange={e => { setGuestEmail(e.target.value); setGuestEmailErr(""); }} />
                  {guestEmailErr && <p className="text-sm" style={{ color: "var(--danger)", marginTop: 4 }}>{guestEmailErr}</p>}
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4, marginBottom: 6 }}>
                <p className="form-label" style={{ fontWeight: 600, marginBottom: 10 }}>🚚 Dane do dostawy</p>
                <div className="form-group">
                  <label className="form-label">Nazwa firmy</label>
                  <input className="form-input" placeholder="opcjonalnie" value={delivery.company}
                    onChange={e => setDelivery(d => ({ ...d, company: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Osoba kontaktowa *</label>
                  <input className="form-input" placeholder="Imię i nazwisko" value={delivery.name}
                    onChange={e => { setDelivery(d => ({ ...d, name: e.target.value })); setDeliveryErr(""); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon *</label>
                  <input className="form-input" type="tel" placeholder="np. 600 100 200" value={delivery.phone}
                    onChange={e => { setDelivery(d => ({ ...d, phone: e.target.value })); setDeliveryErr(""); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Adres dostawy *</label>
                  <input className="form-input" placeholder="ulica, nr, kod pocztowy, miejscowość" value={delivery.address}
                    onChange={e => { setDelivery(d => ({ ...d, address: e.target.value })); setDeliveryErr(""); }} />
                </div>
                <div className="form-group">
                  <label className="form-label">NIP (do faktury)</label>
                  <input className="form-input" placeholder="opcjonalnie" value={delivery.nip}
                    onChange={e => setDelivery(d => ({ ...d, nip: e.target.value }))} />
                </div>
                {deliveryErr && <p className="text-sm" style={{ color: "var(--danger)", marginTop: 2 }}>{deliveryErr}</p>}
              </div>

              <p className="form-label mb-3">Wybierz metodę płatności:</p>
              <div className="pay-methods">
                {methods.map(m => (
                  <div key={m.id} className={`pay-method ${method === m.id ? "selected" : ""}`} onClick={() => setMethod(m.id)}>
                    <span className="pay-method-icon">{m.icon}</span>
                    <span className="pay-method-label">{m.label}</span>
                    <span className="pay-method-sub">{m.sub}</span>
                  </div>
                ))}
              </div>

              {method === "card" && (
                <>
                  <div className="form-group">
                    <label className="form-label">Numer karty</label>
                    <input className="form-input" placeholder="1234 5678 9012 3456" value={card.number}
                      onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))} maxLength={19} />
                  </div>
                  <div className="card-field-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Data ważności</label>
                      <input className="form-input" placeholder="MM/RR" value={card.expiry}
                        onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} maxLength={5} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">CVC</label>
                      <input className="form-input" placeholder="123" value={card.cvc}
                        onChange={e => setCard(c => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 3) }))} maxLength={3} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Imię i nazwisko na karcie</label>
                    <input className="form-input" placeholder="JAN KOWALSKI" value={card.name}
                      onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))} />
                  </div>
                </>
              )}

              {method === "blik" && (
                <div className="text-center">
                  <p className="text-sm text-muted">Wpisz 6-cyfrowy kod BLIK z aplikacji bankowej</p>
                  <div className="blik-input">
                    {blik.map((d, i) => (
                      <input key={i} ref={el => blikRefs.current[i] = el} className="blik-digit" value={d}
                        onChange={e => handleBlikChange(i, e.target.value)} maxLength={1} inputMode="numeric" />
                    ))}
                  </div>
                </div>
              )}

              {method === "transfer" && (
                <div className="info-box">
                  Po kliknięciu "Zapłać" zostaniesz przekierowany do bezpiecznego serwisu Twojego banku, aby autoryzować przelew.
                </div>
              )}

              {method === "cod" && (
                <div className="info-box">
                  Zapłacisz gotówką lub kartą kurierowi przy odbiorze przesyłki. Może obowiązywać dodatkowa opłata za pobranie.
                </div>
              )}

              <button className="btn btn-success w-full mt-4" onClick={submit} disabled={!canSubmit()}>
                🔒 Zapłać {fmt(total)}
              </button>
              <div className="secure-badge">🔒 Połączenie szyfrowane SSL · Twoje dane są bezpieczne</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


// ── GWIAZDKI OCENY (wyświetlanie) ────────────────────────────────────────────
function Stars({ value = 0, count }) {
  const v = Math.round(value);
  return (
    <span className="stars" title={value ? `${value} / 5` : "Brak ocen"}>
      {[1, 2, 3, 4, 5].map(n => <span key={n} className={`star ${n <= v ? "full" : ""}`}>★</span>)}
      {count != null && <span className="text-sm text-muted" style={{ marginLeft: 5 }}>{count > 0 ? `${value} (${count})` : "brak opinii"}</span>}
    </span>
  );
}

function ShopPage({ products, categories, categoriesFull, filterCat, setFilterCat, filterSubcat, setFilterSubcat, searchQ, setSearchQ, onAdd, discount, units, onOpenDetail, allProducts, bannerInfo, setBannerInfo, isAdmin, showAlert, omnibusFloors, productRatings }) {
  const [bannerEditing, setBannerEditing] = useState(false);
  const [bannerForm, setBannerForm] = useState(bannerInfo);
  const bannerFileRef = useRef(null);

  useEffect(() => { setBannerForm(bannerInfo); }, [bannerInfo]);

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showAlert("Wybierz plik graficzny (JPG, PNG)", "danger");
    if (file.size > 3 * 1024 * 1024) return showAlert("Plik jest większy niż 3 MB — wybierz mniejsze zdjęcie", "danger");
    const reader = new FileReader();
    reader.onload = () => setBannerForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveBanner = async () => {
    try {
      await api.saveBannerInfo(bannerForm);
      setBannerInfo(bannerForm);
      setBannerEditing(false);
      showAlert("Baner zapisany");
    } catch (err) {
      showAlert("Nie udało się zapisać banera: " + err.message, "danger");
    }
  };

  const removeBanner = async () => {
    const cleared = { image: "", link: "", enabled: false };
    try {
      await api.saveBannerInfo(cleared);
      setBannerInfo(cleared);
      setBannerForm(cleared);
      showAlert("Baner usunięty");
    } catch (err) {
      showAlert("Nie udało się usunąć banera: " + err.message, "danger");
    }
  };

  const selectCategory = (c) => {
    setFilterCat(c);
    setFilterSubcat("Wszystkie"); // reset podkategorii przy zmianie kategorii głównej
  };

  const activeSubcats = categoriesFull.find(c => c.name === filterCat)?.subcategories || [];
  const countFor = (catName) => catName === "Wszystkie" ? allProducts.length : allProducts.filter(p => p.category === catName).length;
  const showBannerSlot = true; // baner widoczny na każdej stronie kategorii, nie tylko "Wszystkie"

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">🏪 Sklep</h1>
        {discount > 0 && <span className="badge badge-green" style={{ fontSize: ".85rem", padding: "5px 12px" }}>🎉 Twój rabat: {discount}%</span>}
      </div>

      <div className="shop-layout">
        <aside className="category-sidebar">
          <div className="category-sidebar-title">Kategorie</div>
          <table className="category-table">
            <tbody>
              {categories.map(c => {
                const isActive = filterCat === c;
                const subcats = (categoriesFull.find(cf => cf.name === c)?.subcategories || []).filter(s => allProducts.some(p => p.category === c && p.subcategory === s));
                return (
                  <Fragment key={c}>
                    <tr className={`category-row ${isActive ? "active" : ""}`} onClick={() => selectCategory(c)}>
                      <td>{c}</td>
                      <td className="category-count">{countFor(c)}</td>
                    </tr>
                    {isActive && subcats.length > 0 && subcats.map(s => (
                      <tr key={c + "-" + s} className={`subcategory-row ${filterSubcat === s ? "active" : ""}`} onClick={(e) => { e.stopPropagation(); setFilterSubcat(s); }}>
                        <td>↳ {s}</td>
                        <td className="category-count">{allProducts.filter(p => p.category === c && p.subcategory === s).length}</td>
                      </tr>
                    ))}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </aside>

        <div className="shop-main">
          <div className="search-bar">
            <input className="form-input" placeholder="🔍 Szukaj..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ maxWidth: "none", flex: 1 }} />
          </div>
          {filterCat !== "Wszystkie" && activeSubcats.length > 0 && (
            <div className="tabs subcat-tabs" style={{ marginTop: 0 }}>
              <button className={`tab tab-sub ${filterSubcat === "Wszystkie" ? "active" : ""}`} onClick={() => setFilterSubcat("Wszystkie")}>Wszystkie</button>
              {activeSubcats.map(s => <button key={s} className={`tab tab-sub ${filterSubcat === s ? "active" : ""}`} onClick={() => setFilterSubcat(s)}>{s}</button>)}
            </div>
          )}

          {showBannerSlot && (
            <div className="banner-slot">
              {bannerEditing ? (
                <div className="card banner-edit-card">
                  <h3 className="card-title">📣 Edytuj baner reklamowy</h3>
                  <div className="form-group">
                    <label className="form-label">Zdjęcie banera</label>
                    <div className="photo-upload-row">
                      <div className="banner-preview">
                        {bannerForm.image ? <img src={bannerForm.image} alt="podgląd banera" /> : <span className="text-sm text-muted">Brak zdjęcia</span>}
                      </div>
                      <div className="flex gap-2" style={{ flexDirection: "column" }}>
                        <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", width: "fit-content" }}>
                          📷 {bannerForm.image ? "Zmień zdjęcie" : "Wgraj zdjęcie"}
                          <input ref={bannerFileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBannerUpload} />
                        </label>
                        {bannerForm.image && <button type="button" className="btn btn-danger btn-sm" style={{ width: "fit-content" }} onClick={() => setBannerForm(f => ({ ...f, image: "" }))}>🗑️ Usuń zdjęcie</button>}
                        <span className="text-sm text-muted">JPG/PNG, max 3 MB. Polecana szerokość: pełna szerokość sklepu.</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Link (opcjonalnie — dokąd przenosi kliknięcie banera)</label>
                    <input className="form-input" placeholder="https://..." value={bannerForm.link} onChange={e => setBannerForm(f => ({ ...f, link: e.target.value }))} />
                  </div>
                  <label className="flex items-center gap-2" style={{ cursor: "pointer", marginBottom: 14 }}>
                    <input type="checkbox" checked={bannerForm.enabled} onChange={e => setBannerForm(f => ({ ...f, enabled: e.target.checked }))} />
                    <span className="text-sm">Pokazuj baner na stronie głównej sklepu</span>
                  </label>
                  <div className="flex gap-3">
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveBanner}>💾 Zapisz</button>
                    <button className="btn btn-secondary" onClick={() => { setBannerForm(bannerInfo); setBannerEditing(false); }}>Anuluj</button>
                  </div>
                </div>
              ) : bannerInfo.enabled && bannerInfo.image ? (
                <div className="banner-display">
                  {bannerInfo.link ? (
                    <a href={bannerInfo.link} target="_blank" rel="noopener noreferrer">
                      <img src={bannerInfo.image} alt="Reklama" className="banner-image" />
                    </a>
                  ) : (
                    <img src={bannerInfo.image} alt="Reklama" className="banner-image" />
                  )}
                  {isAdmin && (
                    <div className="banner-admin-controls">
                      <button className="btn btn-secondary btn-sm" onClick={() => setBannerEditing(true)}>✏️ Edytuj baner</button>
                      <button className="btn btn-danger btn-sm" onClick={removeBanner}>🗑️ Usuń baner</button>
                    </div>
                  )}
                </div>
              ) : isAdmin ? (
                <div className="banner-placeholder" onClick={() => setBannerEditing(true)}>
                  <div className="banner-placeholder-icon">📣</div>
                  <div className="banner-placeholder-text">Kliknij, aby dodać baner reklamowy</div>
                </div>
              ) : null}
            </div>
          )}

          {products.length === 0
            ? <div className="empty-state"><div className="icon">📦</div>Brak produktów</div>
            : <div className="products-grid">
              {products.map(p => {
                const isVar = hasVariants(p);
                const promo = hasPromo(p) && !isVar;
                const base = effPrice(p);
                const dp = base * (1 - discount / 100);                // cena po rabacie klienta
                const floor = omnibusFloors[p.id];                     // najniższa cena z 30 dni
                const omnibusRef = floor != null ? floor : p.price;
                return (
                  <div key={p.id} className="product-card">
                    <div className="product-emoji product-link" onClick={() => onOpenDetail(p.id)}>{p.photo ? <img src={p.photo} alt={p.name} className="product-photo" /> : p.image}</div>
                    <div className="product-body">
                      <div className="product-name"><a className="product-link" onClick={() => onOpenDetail(p.id)}>{p.name}</a>{isAdmin && p.published === false && <span className="badge badge-orange" style={{ marginLeft: 6 }}>Szkic</span>}</div>
                      {productRatings && productRatings[p.id] && <div style={{ margin: "2px 0" }}><Stars value={productRatings[p.id].avg} count={productRatings[p.id].count} /></div>}
                      <div className="flex gap-2 items-center" style={{ flexWrap: "wrap" }}>
                        <span className="tag">{p.category}</span>
                        {p.subcategory && <span className="tag tag-sub">{p.subcategory}</span>}
                        {!isVar && p.sku && <span className="product-sku">{p.sku}</span>}
                      </div>
                      <div className="product-desc">{p.description}</div>

                      <div>
                        {isVar ? <>
                          <span className="text-sm text-muted" style={{ marginRight: 6 }}>od</span>
                          <span className="product-price">{fmt(grossOf(minVariantPrice(p)))}</span>
                          <span className="text-sm text-muted"> brutto</span>
                          <div className="text-sm text-muted">{fmt(minVariantPrice(p))} netto · {p.variants.length} wariantów</div>
                        </> : promo ? <>
                          <span className="product-price-original">{fmt(p.price)}</span>{" "}
                          <span className="product-price">{fmt(discount > 0 ? dp : base)}</span>
                          <span className="promo-badge">Promocja</span>
                          {discount > 0 && <div className="product-price-discount">w tym Twój rabat {discount}%</div>}
                          <div className="omnibus-note">Najniższa cena z 30 dni przed obniżką: {fmt(omnibusRef)}</div>
                        </> : (discount > 0 ? <>
                          <span className="product-price-original">{fmt(base)}</span>{" "}
                          <span className="product-price">{fmt(dp)}</span>
                          <div className="product-price-discount">Oszczędzasz {fmt(base - dp)}</div>
                        </> : <span className="product-price">{fmt(base)}</span>)}
                      </div>
                      <div className="text-sm text-muted">Magazyn: <strong>{p.stock}</strong> {units.find(u => u.value === p.unit)?.label || "szt."}</div>
                    </div>
                    <div className="product-footer">
                      {isVar
                        ? <button className="btn btn-primary w-full" onClick={() => onOpenDetail(p.id)} disabled={p.stock === 0}>{p.stock === 0 ? "Brak w magazynie" : "Wybierz wariant →"}</button>
                        : <button className="btn btn-primary w-full" onClick={() => onAdd(p)} disabled={p.stock === 0}>
                            {p.stock === 0 ? "Brak w magazynie" : "🛒 Dodaj"}
                          </button>}
                    </div>
                  </div>
                );
              })}
            </div>}
        </div>
      </div>
    </>
  );
}

// ── IMPORT CSV (główna nowość) ─────────────────────────────────────────────────
// ── STRONA SZCZEGÓŁÓW PRODUKTU ────────────────────────────────────────────────
function ProductDetailPage({ product, units, discount, onAdd, onBack, omnibusFloors, productRatings, currentUser, isGuest, isAdmin, showAlert }) {
  const [combo, setCombo] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 0, comment: "" });
  const [reviewSending, setReviewSending] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({ quantity: "", name: "", email: "", phone: "", company: "", message: "" });
  const [quoteSending, setQuoteSending] = useState(false);

  useEffect(() => {
    setCombo(autoSelectCombo(product));
    setReviewForm({ name: !isGuest && currentUser ? (currentUser.name || "") : "", rating: 0, comment: "" });
    setQuoteOpen(false);
    setQuoteForm({ quantity: "", name: !isGuest && currentUser ? (currentUser.name || "") : "", email: !isGuest && currentUser ? (currentUser.email || "") : "", phone: "", company: "", message: "" });
    if (!product) { setReviews([]); return; }
    let cancelled = false;
    (async () => {
      try { const r = await api.fetchReviews(product.id); if (!cancelled) setReviews(r || []); }
      catch (e) { if (!cancelled) setReviews([]); }
    })();
    return () => { cancelled = true; };
  }, [product?.id]);

  // ── SCHEMA.ORG PRODUCT (JSON-LD) + tytuł strony + canonical ─────────────────
  useEffect(() => {
    if (!product || typeof document === "undefined") return;
    if (!product.published && !isAdmin) return;
    const prevTitle = document.title;
    document.title = `${product.name} — TARFIX`;

    const url = window.location.origin + window.location.pathname;
    const rating = productRatings ? productRatings[product.id] : null;
    const inStock = (product.stock || 0) > 0;
    const availability = inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";

    let offers;
    if (hasVariants(product)) {
      const nets = (product.variants || []).map(v => +v.price || 0).filter(n => n > 0);
      const low = nets.length ? grossOf(Math.min(...nets)) : 0;
      const high = nets.length ? grossOf(Math.max(...nets)) : 0;
      offers = { "@type": "AggregateOffer", priceCurrency: "PLN", lowPrice: low, highPrice: high, offerCount: (product.variants || []).length, availability, url };
    } else {
      offers = { "@type": "Offer", priceCurrency: "PLN", price: effPrice(product), availability, url };
    }

    const ld = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      description: product.description || product.name,
      sku: product.sku || String(product.id),
      brand: { "@type": "Brand", name: "TARFIX" },
      offers,
    };
    if (product.category) ld.category = product.category;
    if (typeof product.photo === "string" && /^https?:\/\//.test(product.photo)) ld.image = product.photo;
    if (rating && rating.count > 0) ld.aggregateRating = { "@type": "AggregateRating", ratingValue: rating.avg, reviewCount: rating.count };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-product-ld", "1");
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);

    let canonical = document.querySelector('link[rel="canonical"][data-product="1"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("data-product", "1");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = prevTitle;
      script.remove();
      if (canonical) canonical.remove();
    };
  }, [product?.id, productRatings, reviews]);

  const submitReview = async () => {
    if (!reviewForm.name.trim()) return showAlert("Podaj imię/nazwę.", "danger");
    if (!reviewForm.rating) return showAlert("Wybierz ocenę (gwiazdki).", "danger");
    setReviewSending(true);
    try {
      await api.createReview({
        product_id: product.id, user_id: isGuest ? null : currentUser?.id || null,
        author_name: reviewForm.name.trim(), rating: reviewForm.rating, comment: reviewForm.comment.trim() || null,
      });
      const r = await api.fetchReviews(product.id);
      setReviews(r || []);
      setReviewForm(f => ({ ...f, rating: 0, comment: "" }));
      showAlert("Dziękujemy za opinię!", "success");
    } catch (e) {
      showAlert("Nie udało się dodać opinii: " + (e?.message || ""), "danger");
    } finally {
      setReviewSending(false);
    }
  };

  const deleteReview = async (id) => {
    try { await api.deleteReview(id); setReviews(prev => prev.filter(r => r.id !== id)); showAlert("Opinia usunięta."); }
    catch (e) { showAlert("Nie udało się usunąć opinii: " + e.message, "danger"); }
  };

  const submitQuote = async () => {
    if (!quoteForm.name.trim() || !quoteForm.email.trim()) return showAlert("Podaj imię i e-mail.", "danger");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteForm.email)) return showAlert("Podaj poprawny e-mail.", "danger");
    setQuoteSending(true);
    try {
      await api.createQuoteRequest({
        user_id: isGuest ? null : currentUser?.id || null, product_id: product.id, product_name: product.name,
        quantity: quoteForm.quantity ? +quoteForm.quantity : null, name: quoteForm.name.trim(), email: quoteForm.email.trim(),
        phone: quoteForm.phone || null, company: quoteForm.company || null, message: quoteForm.message || null,
      });
      showAlert("Zapytanie ofertowe wysłane. Odezwiemy się z wyceną.", "success");
      setQuoteOpen(false);
      setQuoteForm(f => ({ ...f, quantity: "", message: "" }));
    } catch (e) {
      showAlert("Nie udało się wysłać zapytania: " + (e?.message || ""), "danger");
    } finally {
      setQuoteSending(false);
    }
  };

  if (!product || (!product.published && !isAdmin)) {
    return (
      <div className="empty-state">
        <div className="icon">❓</div>
        Produkt nie został znaleziony.
        <div className="mt-4"><button className="btn btn-primary" onClick={onBack}>← Wróć do sklepu</button></div>
      </div>
    );
  }

  const ratingInfo = productRatings ? productRatings[product.id] : null;

  const promo = hasPromo(product) && !hasVariants(product);
  const base = effPrice(product);
  const discountedPrice = base * (1 - discount / 100);
  const floor = omnibusFloors ? omnibusFloors[product.id] : null;
  const omnibusRef = floor != null ? floor : product.price;
  const unitLabel = units.find(u => u.value === product.unit)?.label || "szt.";
  const isVar = hasVariants(product);
  const matched = isVar ? findVariant(product, combo) : null;
  const allSelected = isVar && (product.attributeGroups || []).every(g => combo[g.name]);

  return (
    <>
      <div className="pdp-breadcrumb">
        <a onClick={onBack}>🏪 Sklep</a> / <span className="tag">{product.category}</span>
        {product.subcategory && <> / <span className="tag tag-sub">{product.subcategory}</span></>}
        {" / "}<strong>{product.name}</strong>
      </div>

      <div className="pdp-grid">
        <div className="pdp-image-box">
          {product.photo
            ? <img src={product.photo} alt={product.name} />
            : <span className="emoji-fallback">{product.image}</span>}
        </div>

        <div>
          <h1 className="pdp-title">{product.name}</h1>
          <div className="flex gap-2 items-center" style={{ flexWrap: "wrap", marginBottom: 6 }}>
            <span className="tag">{product.category}</span>
            {product.subcategory && <span className="tag tag-sub">{product.subcategory}</span>}
            {product.sku && <span className="product-sku">{product.sku}</span>}
          </div>
          <p className="text-muted">{product.description}</p>

          {isVar ? (
            <>
              {(product.attributeGroups || []).map(g => {
                const avail = availableValues(product, g.name, combo);
                return (
                  <div key={g.id || g.name} className="attr-group">
                    <div className="attr-group-label">{g.name}{combo[g.name] ? `: ${combo[g.name]}` : ""}</div>
                    <div className="attr-tiles">
                      {(g.values || []).map(val => {
                        const active = combo[g.name] === val;
                        const enabled = avail.has(val);
                        return (
                          <button key={val} type="button" className={`attr-tile ${active ? "active" : ""}`} disabled={!enabled && !active}
                            onClick={() => setCombo(c => active ? { ...c, [g.name]: undefined } : { ...c, [g.name]: val })}>
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="pdp-price" style={{ marginTop: 8 }}>
                {!allSelected
                  ? <><span className="text-sm text-muted">od </span>{fmt(grossOf(minVariantPrice(product)))} <span className="text-sm text-muted">brutto · {fmt(minVariantPrice(product))} netto</span><div className="text-sm text-muted" style={{ fontSize: ".85rem" }}>Wybierz wszystkie opcje, aby zobaczyć cenę</div></>
                  : matched
                    ? <>
                        <span className="product-price">{fmt(grossOf(matched.price))}</span> <span className="text-sm text-muted">brutto</span>
                        <div className="text-sm text-muted" style={{ fontSize: ".9rem" }}>{fmt(matched.price)} netto + VAT 23%</div>
                        {discount > 0 && <div className="product-price-discount" style={{ fontSize: ".9rem" }}>🎉 Twój rabat {discount}% — cena brutto: {fmt(grossOf(matched.price) * (1 - discount / 100))}</div>}
                        {matched.sku && <div className="text-sm text-muted" style={{ fontSize: ".85rem" }}>SKU: {matched.sku}{matched.weight ? ` · waga: ${matched.weight} kg` : ""}</div>}
                      </>
                    : <span style={{ color: "var(--danger)", fontSize: "1rem" }}>Ta kombinacja jest niedostępna</span>}
              </div>

              <button className="btn btn-primary" style={{ marginTop: 16, padding: "12px 28px", fontSize: "1rem" }} disabled={!matched || product.stock === 0}
                onClick={() => onAdd(product, { id: matched.id, name: comboLabel(matched.combo), price: grossOf(matched.price), sku: matched.sku, weight: matched.weight })}>
                {product.stock === 0 ? "Brak w magazynie" : !allSelected ? "Wybierz opcje powyżej" : !matched ? "Kombinacja niedostępna" : "🛒 Dodaj do koszyka"}
              </button>
            </>
          ) : (
            <>
              <div className="pdp-price">
                {promo ? (
                  <>
                    <span className="product-price-original" style={{ fontSize: "1.1rem" }}>{fmt(product.price)}</span>{" "}
                    {fmt(discount > 0 ? discountedPrice : base)}
                    <span className="promo-badge">Promocja</span>
                    {discount > 0 && <div className="product-price-discount" style={{ fontSize: ".9rem" }}>🎉 w tym Twój rabat {discount}%</div>}
                    <div className="omnibus-note" style={{ fontSize: ".85rem" }}>Najniższa cena z 30 dni przed obniżką: {fmt(omnibusRef)}</div>
                  </>
                ) : (discount > 0 ? (
                  <>
                    <span className="product-price-original" style={{ fontSize: "1.1rem" }}>{fmt(base)}</span>{" "}
                    {fmt(discountedPrice)}
                    <div className="product-price-discount" style={{ fontSize: ".9rem" }}>🎉 Twój rabat {discount}% — oszczędzasz {fmt(base - discountedPrice)}</div>
                  </>
                ) : fmt(base))}
              </div>

              <p className="text-sm text-muted">Magazyn: <strong>{product.stock}</strong> {unitLabel}{product.weight ? ` · waga: ${product.weight} kg` : ""}</p>
              {product.sku && <p className="text-sm text-muted" style={{ marginTop: -6 }}>SKU: {product.sku}</p>}

              <button className="btn btn-primary" style={{ marginTop: 16, padding: "12px 28px", fontSize: "1rem" }} onClick={() => onAdd(product)} disabled={product.stock === 0}>
                {product.stock === 0 ? "Brak w magazynie" : "🛒 Dodaj do koszyka"}
              </button>
            </>
          )}

          {product.longDescription && (
            <>
              <h2 className="pdp-section-title">Opis produktu</h2>
              <div className="pdp-rich-content" dangerouslySetInnerHTML={{ __html: product.longDescription }} />
            </>
          )}

          {product.specs && product.specs.filter(s => s.key).length > 0 && (
            <>
              <h2 className="pdp-section-title">Specyfikacja techniczna</h2>
              <table className="specs-table">
                <tbody>
                  {product.specs.filter(s => s.key).map((s, i) => (
                    <tr key={i}><td>{s.key}</td><td>{s.value}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ZAPYTANIE OFERTOWE (przy większych ilościach) */}
          <div className="card" style={{ marginTop: 24, background: "#f8fafc" }}>
            <div className="flex items-center gap-3" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div>
                <strong>📝 Potrzebujesz większej ilości?</strong>
                <div className="text-sm text-muted">Wyślij zapytanie ofertowe — przygotujemy indywidualną wycenę.</div>
              </div>
              <button className="btn btn-secondary" onClick={() => setQuoteOpen(o => !o)}>{quoteOpen ? "Zwiń" : "Zapytaj o ofertę"}</button>
            </div>
            {quoteOpen && (
              <div style={{ marginTop: 14 }}>
                <div className="flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Ilość</label><input className="form-input" type="number" min="1" value={quoteForm.quantity} onChange={e => setQuoteForm(f => ({ ...f, quantity: e.target.value }))} placeholder="np. 500" /></div>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Firma</label><input className="form-input" value={quoteForm.company} onChange={e => setQuoteForm(f => ({ ...f, company: e.target.value }))} placeholder="opcjonalnie" /></div>
                </div>
                <div className="flex gap-3">
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">Imię i nazwisko *</label><input className="form-input" value={quoteForm.name} onChange={e => setQuoteForm(f => ({ ...f, name: e.target.value }))} /></div>
                  <div className="form-group" style={{ flex: 1 }}><label className="form-label">E-mail *</label><input className="form-input" type="email" value={quoteForm.email} onChange={e => setQuoteForm(f => ({ ...f, email: e.target.value }))} /></div>
                </div>
                <div className="form-group"><label className="form-label">Telefon</label><input className="form-input" type="tel" value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Wiadomość</label><textarea className="form-input" style={{ minHeight: 80 }} value={quoteForm.message} onChange={e => setQuoteForm(f => ({ ...f, message: e.target.value }))} placeholder="Dodatkowe informacje, np. termin, parametry…" /></div>
                <button className="btn btn-primary" onClick={submitQuote} disabled={quoteSending}>{quoteSending ? "Wysyłanie…" : "📨 Wyślij zapytanie"}</button>
              </div>
            )}
          </div>

          {/* OPINIE I OCENY */}
          <div style={{ marginTop: 28 }}>
            <h2 className="pdp-section-title">Opinie i oceny {ratingInfo && ratingInfo.count > 0 && <span style={{ fontWeight: 400 }}>— <Stars value={ratingInfo.avg} count={ratingInfo.count} /></span>}</h2>

            {reviews.length === 0 ? <p className="text-muted">Brak opinii. Bądź pierwszy!</p>
              : reviews.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid var(--border)", padding: "10px 0" }}>
                  <div className="flex items-center gap-3" style={{ justifyContent: "space-between" }}>
                    <div><strong>{r.author_name}</strong> <Stars value={r.rating} /></div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted">{new Date(r.created_at).toLocaleDateString("pl-PL")}</span>
                      {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>🗑️</button>}
                    </div>
                  </div>
                  {r.comment && <div style={{ marginTop: 4 }}>{r.comment}</div>}
                </div>
              ))}

            <div className="card" style={{ marginTop: 16 }}>
              <strong>Dodaj opinię</strong>
              <div className="form-group" style={{ marginTop: 8 }}><label className="form-label">Twoja ocena *</label>
                <div>{[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button" className={`star-btn ${n <= reviewForm.rating ? "on" : ""}`} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>★</button>
                ))}</div>
              </div>
              <div className="form-group"><label className="form-label">Imię / nazwa *</label><input className="form-input" value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Komentarz</label><textarea className="form-input" style={{ minHeight: 80 }} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Napisz, co sądzisz o produkcie…" /></div>
              <button className="btn btn-primary" onClick={submitReview} disabled={reviewSending}>{reviewSending ? "Wysyłanie…" : "Dodaj opinię"}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


// ── STRONA KONTAKT ────────────────────────────────────────────────────────────
function ContactPage({ contactInfo, setContactInfo, isAdmin, showAlert }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(contactInfo);

  useEffect(() => { setForm(contactInfo); }, [contactInfo]);

  const save = async () => {
    try {
      await api.saveContactInfo(form);
      setContactInfo(form);
      setEditing(false);
      showAlert("Dane kontaktowe zapisane");
    } catch (err) {
      showAlert("Nie udało się zapisać do bazy danych: " + err.message, "danger");
    }
  };

  const cancel = () => { setForm(contactInfo); setEditing(false); };

  if (editing) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">✉️ Edytuj dane kontaktowe</h1>
        </div>
        <div className="card" style={{ maxWidth: 560 }}>
          <div className="form-group"><label className="form-label">Nazwa firmy</label>
            <input className="form-input" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Adres</label>
            <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
          <div className="flex gap-3">
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">Telefon</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="form-group" style={{ flex: 1 }}><label className="form-label">E-mail</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          </div>
          <div className="form-group"><label className="form-label">Godziny otwarcia</label>
            <input className="form-input" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Link do mapy (osadzony iframe, opcjonalnie)</label>
            <input className="form-input" placeholder="https://www.google.com/maps/embed?..." value={form.mapEmbedUrl} onChange={e => setForm(f => ({ ...f, mapEmbedUrl: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Dodatkowa notatka</label>
            <input className="form-input" value={form.extraNote} onChange={e => setForm(f => ({ ...f, extraNote: e.target.value }))} /></div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>💾 Zapisz</button>
            <button className="btn btn-secondary" onClick={cancel}>Anuluj</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">✉️ Kontakt</h1>
        {isAdmin && <button className="btn btn-secondary" onClick={() => setEditing(true)}>✏️ Edytuj dane kontaktowe</button>}
      </div>
      <div className="contact-grid">
        <div className="card">
          <h2 className="card-title">{contactInfo.companyName}</h2>
          <div className="contact-row">📍 <span>{contactInfo.address}</span></div>
          <div className="contact-row">📞 <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>{contactInfo.phone}</a></div>
          <div className="contact-row">✉️ <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a></div>
          <div className="contact-row">🕒 <span>{contactInfo.hours}</span></div>
          {contactInfo.extraNote && <p className="text-muted mt-4" style={{ lineHeight: 1.6 }}>{contactInfo.extraNote}</p>}
        </div>
        {contactInfo.mapEmbedUrl && (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <iframe src={contactInfo.mapEmbedUrl} className="contact-map" loading="lazy" title="Mapa lokalizacji"></iframe>
          </div>
        )}
      </div>
    </>
  );
}


function CsvImportPage({ products, setProducts, units, setUnits, showAlert, setLastSync }) {
  const [step, setStep] = useState(1); // 1=wgraj 2=mapuj 3=podgląd 4=wynik
  const [rawData, setRawData] = useState(null);   // sparsowane wiersze CSV
  const [csvHeaders, setCsvHeaders] = useState([]); // nagłówki z CSV
  const [mapping, setMapping] = useState(DEFAULT_MAPPING);
  const [preview, setPreview] = useState([]);     // przetworzone produkty
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [encoding, setEncoding] = useState("auto"); // auto / UTF-8 / windows-1250
  const [detectedEncoding, setDetectedEncoding] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingNewUnits, setPendingNewUnits] = useState([]);
  const [importMode, setImportMode] = useState("full"); // full / variants / prices
  const [prefixRule, setPrefixRule] = useState("last"); // last / first / chars
  const [prefixN, setPrefixN] = useState(3);
  const [attrName, setAttrName] = useState("Rozmiar");
  const [priceType, setPriceType] = useState("netto"); // netto / brutto (ceny w pliku)
  const [grouped, setGrouped] = useState([]); // produkty z wariantami (podgląd)
  const [pricePreview, setPricePreview] = useState([]); // dopasowane zmiany cen
  const [priceUnmatched, setPriceUnmatched] = useState([]); // SKU z pliku bez dopasowania
  const fileRef = useRef();

  const FIELDS = [
    { key: "sku", label: "Indeks / SKU", required: true },
    { key: "name", label: "Nazwa towaru", required: true },
    { key: "category", label: "Kategoria", required: false },
    { key: "price", label: "Cena (brutto)", required: true },
    { key: "stock", label: "Stan magazynowy", required: true },
    { key: "unit", label: "Jednostka miary", required: false },
    { key: "description", label: "Opis", required: false },
  ];

  // Wykrywa, czy bajty pliku wyglądają na prawidłowy UTF-8.
  // Polskie znaki w UTF-8 to 2-bajtowe sekwencje (np. "ą" = 0xC4 0x85).
  // Jeśli dekodowanie jako UTF-8 produkuje znak zamiany "�" (U+FFFD), to NIE jest UTF-8.
  const detectEncoding = (bytes) => {
    const utf8Text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (!utf8Text.includes("\uFFFD")) return "UTF-8";
    return "windows-1250"; // niemal zawsze tak eksportuje WF-Mag i inne polskie programy
  };

  const decodeAndParse = (file, forcedEncoding) => {
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array(reader.result);
      const usedEncoding = forcedEncoding && forcedEncoding !== "auto" ? forcedEncoding : detectEncoding(bytes);
      setDetectedEncoding(usedEncoding);
      let text;
      try {
        text = new TextDecoder(usedEncoding).decode(bytes);
      } catch {
        text = new TextDecoder("utf-8").decode(bytes);
      }
      Papa.parse(text, {
        header: true,
        delimiter: ";",
        skipEmptyLines: true,
        complete: (res) => {
          if (!res.data.length) { showAlert("Plik CSV jest pusty lub niepoprawny", "danger"); return; }
          const headers = Object.keys(res.data[0]);
          setCsvHeaders(headers);
          setRawData(res.data);
          const autoMap = { ...DEFAULT_MAPPING };
          FIELDS.forEach(f => {
            const match = headers.find(h =>
              h.toLowerCase().includes(f.key) ||
              h.toLowerCase().includes(f.label.toLowerCase().split(" ")[0].toLowerCase())
            );
            if (match) autoMap[f.key] = match;
            else if (!headers.includes(autoMap[f.key])) autoMap[f.key] = headers[0] || "";
          });
          setMapping(autoMap);
          setStep(2);
        },
        error: () => showAlert("Błąd odczytu pliku CSV", "danger"),
      });
    };
    reader.onerror = () => showAlert("Nie udało się wczytać pliku", "danger");
    reader.readAsArrayBuffer(file);
  };

  const parseFile = (file) => {
    setFileName(file.name);
    setPendingFile(file);
    decodeAndParse(file, encoding);
  };

  const reparseWithEncoding = (newEncoding) => {
    setEncoding(newEncoding);
    if (pendingFile) decodeAndParse(pendingFile, newEncoding);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) parseFile(file);
    else showAlert("Proszę wgrać plik .csv", "warning");
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) parseFile(file);
  };

  // Próbuje dopasować jednostkę z CSV do istniejącej (po aliasach lub dokładnej nazwie/symbolu).
  // Jeśli nic nie pasuje, zwraca null — sygnał, że trzeba założyć nową jednostkę.
  const resolveUnit = (rawValue) => {
    const v = String(rawValue || "").trim().toLowerCase();
    if (!v) return { value: "szt", isNew: false }; // brak danych w CSV -> domyślnie sztuka
    const aliasTarget = UNIT_ALIASES[v];
    if (aliasTarget) {
      const existing = units.find(u => u.value === aliasTarget);
      if (existing) return { value: existing.value, isNew: false };
    }
    // sprawdź czy coś już dokładnie odpowiada wartości (po symbolu lub nazwie)
    const exact = units.find(u => u.value.toLowerCase() === v || u.label.toLowerCase() === v);
    if (exact) return { value: exact.value, isNew: false };
    // nic nie znaleziono -> nowa jednostka, używamy oryginalnego tekstu z CSV jako symbolu i etykiety
    const newValue = aliasTarget || v;
    return { value: newValue, isNew: true, label: String(rawValue).trim() };
  };

  const buildPreview = () => {
    if (!rawData) return;
    const newUnitsFound = new Map(); // value -> label, zbieramy unikalne nowe jednostki z całego pliku
    const rows = rawData.map((row, idx) => {
      const sku = String(row[mapping.sku] || "").trim();
      const name = String(row[mapping.name] || "").trim();
      const category = String(row[mapping.category] || "Inne").trim();
      const price = parseNum(row[mapping.price]);
      const stock = Math.round(parseNum(row[mapping.stock]));
      const description = String(row[mapping.description] || "").trim();
      const unitRaw = mapping.unit ? row[mapping.unit] : "";
      const resolvedUnit = resolveUnit(unitRaw);
      if (resolvedUnit.isNew) newUnitsFound.set(resolvedUnit.value, resolvedUnit.label);
      const existing = products.find(p => p.sku === sku);
      let status = "new";
      if (existing) {
        status = (existing.price !== price || existing.stock !== stock || existing.name !== name || existing.unit !== resolvedUnit.value) ? "update" : "unchanged";
      }
      return { idx, sku, name, category, price, stock, description, unit: resolvedUnit.value, unitIsNew: resolvedUnit.isNew, status, existing };
    }).filter(r => r.name && r.price > 0);
    setPreview(rows);
    setPendingNewUnits([...newUnitsFound.entries()].map(([value, label]) => ({ value, label })));
    setStep(3);
  };

  // ── TRYB WARIANTÓW: grupowanie wierszy w produkty z wariantami ──────────────
  const buildVariantPreview = () => {
    if (!rawData) return;
    const newUnitsFound = new Map();
    const groupsMap = new Map(); // key -> rows[]
    rawData.forEach(row => {
      const sku = String(row[mapping.sku] || "").trim();
      const name = String(row[mapping.name] || "").trim();
      if (!sku || !name) return;
      const key = skuPrefix(sku, prefixRule, prefixN);
      if (!groupsMap.has(key)) groupsMap.set(key, []);
      groupsMap.get(key).push(row);
    });

    const out = [];
    for (const [key, rows] of groupsMap.entries()) {
      const names = rows.map(r => String(r[mapping.name] || "").trim());
      const baseName = longestCommonPrefix(names) || names[0] || key;
      const category = String(rows[0][mapping.category] || "Inne").trim();
      const description = String(rows[0][mapping.description] || "").trim();
      const unitRaw = mapping.unit ? rows[0][mapping.unit] : "";
      const resolvedUnit = resolveUnit(unitRaw);
      if (resolvedUnit.isNew) newUnitsFound.set(resolvedUnit.value, resolvedUnit.label);

      const variants = rows.map((r, i) => {
        const rname = String(r[mapping.name] || "").trim();
        const rsku = String(r[mapping.sku] || "").trim();
        const priceRaw = parseNum(r[mapping.price]);
        const net = priceType === "brutto" ? netOf(priceRaw) : priceRaw;
        const stock = Math.round(parseNum(r[mapping.stock]));
        // rozmiar: z nazwy, a jeśli się nie uda — fragment nazwy po wspólnym przedrostku, na końcu SKU
        let size = extractSize(rname);
        if (!size && baseName && rname.startsWith(baseName)) size = rname.slice(baseName.length).replace(/^[\s\-–,.:]+/, "").trim();
        if (!size) { const i2 = rsku.lastIndexOf("-"); size = i2 >= 0 ? rsku.slice(i2 + 1) : `wariant ${i + 1}`; }
        return { id: `v_${rsku || i}`, combo: { [attrName]: size }, price: net, sku: rsku, weight: 0, _stock: stock };
      });

      const values = [...new Set(variants.map(v => v.combo[attrName]))];
      const totalStock = variants.reduce((s, v) => s + (v._stock || 0), 0);
      const single = rows.length === 1;
      const existing = products.find(p => p.sku === key);

      out.push({
        key, baseName, category, description, unit: resolvedUnit.value, unitIsNew: resolvedUnit.isNew,
        single, totalStock, status: existing ? "update" : "new", existingId: existing?.id || null,
        attributeGroups: single ? [] : [{ id: `g_${key}`, name: attrName, values }],
        variants: single ? [] : variants.map(({ _stock, ...v }) => v),
        singlePrice: single ? (priceType === "brutto" ? variants[0].price * (1 + VAT_RATE) : grossOf(variants[0].price)) : null,
        minNet: variants.length ? Math.min(...variants.map(v => v.price)) : 0,
      });
    }
    setGrouped(out);
    setPendingNewUnits([...newUnitsFound.entries()].map(([value, label]) => ({ value, label })));
    setStep(3);
  };

  const doVariantImport = async () => {
    if (pendingNewUnits.length > 0) {
      setUnits(prev => {
        const existingValues = new Set(prev.map(u => u.value));
        return [...prev, ...pendingNewUnits.filter(u => !existingValues.has(u.value))];
      });
    }
    let added = 0, updated = 0;
    try {
      const newProds = [...products];
      for (const g of grouped) {
        const basePriceBrutto = g.single ? Math.round(g.singlePrice * 100) / 100 : grossOf(g.minNet);
        const payload = {
          sku: g.key, name: g.baseName, category: g.category, subcategory: "",
          description: g.description, price: basePriceBrutto, promo_price: null,
          stock: g.totalStock, weight: 0, unit: g.unit, image: getEmoji(g.category),
          long_description: "", specs: [],
          attribute_groups: g.attributeGroups, variants: g.variants,
          published: false, // import do bufora — najpierw sprawdzasz, potem publikujesz
        };
        if (g.existingId) {
          const upd = await api.updateProduct(g.existingId, payload);
          const i = newProds.findIndex(p => p.id === g.existingId);
          const mapped = { ...payload, id: g.existingId, promoPrice: null, attributeGroups: g.attributeGroups, variants: g.variants, published: false };
          if (i >= 0) newProds[i] = { ...newProds[i], ...mapped }; updated++;
        } else {
          const created = await api.addProduct(payload);
          newProds.push({ ...payload, id: created.id, promoPrice: null, attributeGroups: g.attributeGroups, variants: g.variants, published: false });
          added++;
        }
      }
      setProducts(newProds);
    } catch (err) {
      showAlert("Błąd zapisu do bazy danych: " + err.message, "danger");
      return;
    }
    setResult({ added, updated, unchanged: 0, total: grouped.length, newUnits: pendingNewUnits.length, variant: true });
    setLastSync({ file: fileName, imported: added + updated, time: new Date().toLocaleTimeString("pl-PL") });
    showAlert(`✅ Import wariantów: ${added} nowych, ${updated} zaktualizowanych (w buforze — opublikuj po sprawdzeniu)`, "success");
    setStep(4);
  };

  // ── TRYB CEN: aktualizacja cen po SKU (dopasowuje produkty i warianty) ───────
  const buildPricePreview = () => {
    if (!rawData) return;
    // Mapa SKU(lower) -> cena z pliku
    const priceMap = new Map();
    rawData.forEach(row => {
      const sku = String(row[mapping.sku] || "").trim();
      if (!sku) return;
      priceMap.set(sku.toLowerCase(), parseNum(row[mapping.price]));
    });
    const matched = [];
    const usedSkus = new Set();
    products.forEach(p => {
      if (hasVariants(p)) {
        (p.variants || []).forEach(v => {
          const key = String(v.sku || "").trim().toLowerCase();
          if (key && priceMap.has(key)) {
            usedSkus.add(key);
            const raw = priceMap.get(key);
            const newNet = priceType === "brutto" ? netOf(raw) : raw;
            if (Math.abs(newNet - (+v.price || 0)) > 0.001) {
              matched.push({ type: "variant", productId: p.id, variantId: v.id, sku: v.sku, name: `${p.name} · ${comboLabel(v.combo)}`, oldNet: +v.price || 0, newNet });
            }
          }
        });
      } else {
        const key = String(p.sku || "").trim().toLowerCase();
        if (key && priceMap.has(key)) {
          usedSkus.add(key);
          const raw = priceMap.get(key);
          const newGross = priceType === "netto" ? grossOf(raw) : (Math.round(raw * 100) / 100);
          if (Math.abs(newGross - (+p.price || 0)) > 0.001) {
            matched.push({ type: "product", productId: p.id, sku: p.sku, name: p.name, oldGross: +p.price || 0, newGross });
          }
        }
      }
    });
    const unmatched = [];
    priceMap.forEach((_, key) => { if (!usedSkus.has(key)) unmatched.push(key); });
    setPricePreview(matched);
    setPriceUnmatched(unmatched);
    setStep(3);
  };

  const doPriceImport = async () => {
    // Grupujemy zmiany po produkcie (jeden update na produkt, także gdy zmienia się kilka wariantów).
    const byProduct = new Map();
    pricePreview.forEach(m => {
      if (!byProduct.has(m.productId)) byProduct.set(m.productId, []);
      byProduct.get(m.productId).push(m);
    });
    let changed = 0;
    try {
      const newProds = [...products];
      for (const [pid, changes] of byProduct.entries()) {
        const idx = newProds.findIndex(p => p.id === pid);
        if (idx < 0) continue;
        const prod = newProds[idx];
        let payload, mappedLocal;
        if (hasVariants(prod)) {
          const newVariants = (prod.variants || []).map(v => {
            const ch = changes.find(c => c.type === "variant" && c.variantId === v.id);
            return ch ? { ...v, price: ch.newNet } : v;
          });
          const minNet = newVariants.length ? Math.min(...newVariants.map(v => +v.price || 0)) : 0;
          payload = { variants: newVariants, price: grossOf(minNet) };
          mappedLocal = { ...prod, variants: newVariants, price: grossOf(minNet) };
        } else {
          const ch = changes.find(c => c.type === "product");
          if (!ch) continue;
          payload = { price: ch.newGross };
          mappedLocal = { ...prod, price: ch.newGross };
        }
        await api.updateProduct(pid, payload);
        newProds[idx] = mappedLocal;
        changed += changes.length;
      }
      setProducts(newProds);
    } catch (err) {
      showAlert("Błąd zapisu cen do bazy danych: " + err.message, "danger");
      return;
    }
    setResult({ added: 0, updated: changed, unchanged: priceUnmatched.length, total: pricePreview.length, priceMode: true });
    setLastSync({ file: fileName, imported: changed, time: new Date().toLocaleTimeString("pl-PL") });
    showAlert(`✅ Zaktualizowano ${changed} ${changed === 1 ? "cenę" : "cen"} po SKU`, "success");
    setStep(4);
  };

  const doImport = async () => {
    // Najpierw rejestrujemy w systemie wszystkie nowe jednostki znalezione w pliku
    if (pendingNewUnits.length > 0) {
      setUnits(prev => {
        const existingValues = new Set(prev.map(u => u.value));
        const toAdd = pendingNewUnits.filter(u => !existingValues.has(u.value));
        return [...prev, ...toAdd];
      });
    }
    const toUpsert = preview.filter(row => row.status !== "unchanged").map(row => ({
      ...(row.existing?.id ? { id: row.existing.id } : {}),
      sku: row.sku, name: row.name, category: row.category,
      price: row.price, stock: row.stock, unit: row.unit,
      description: row.description, image: getEmoji(row.category),
    }));

    let added = 0, updated = 0, unchanged = 0;
    try {
      const saved = toUpsert.length > 0 ? await api.upsertProductsBySku(toUpsert) : [];
      const newProds = [...products];
      preview.forEach(row => {
        if (row.status === "unchanged") { unchanged++; return; }
        const savedRow = saved.find(s => s.sku === row.sku);
        const prod = {
          id: savedRow?.id || row.existing?.id || Date.now() + Math.random(),
          sku: row.sku, name: row.name, category: row.category,
          price: row.price, stock: row.stock, unit: row.unit,
          description: row.description, image: getEmoji(row.category),
        };
        if (row.status === "new") { newProds.push(prod); added++; }
        else {
          const i = newProds.findIndex(p => p.sku === row.sku);
          if (i >= 0) { newProds[i] = { ...newProds[i], ...prod }; updated++; }
        }
      });
      setProducts(newProds);
    } catch (err) {
      showAlert("Błąd zapisu do bazy danych: " + err.message, "danger");
      return;
    }
    const res = { added, updated, unchanged, total: preview.length, newUnits: pendingNewUnits.length };
    setResult(res);
    setLastSync({ file: fileName, imported: added + updated, time: new Date().toLocaleTimeString("pl-PL") });
    const unitMsg = pendingNewUnits.length > 0 ? ` · założono ${pendingNewUnits.length} nowych jednostek` : "";
    showAlert(`✅ Import zakończony: ${added} nowych, ${updated} zaktualizowanych${unitMsg}`, "success");
    setStep(4);
  };

  const reset = () => { setStep(1); setRawData(null); setCsvHeaders([]); setPreview([]); setResult(null); setFileName(""); setEncoding("auto"); setDetectedEncoding(null); setPendingFile(null); setPendingNewUnits([]); setGrouped([]); setPricePreview([]); setPriceUnmatched([]); };

  const downloadSample = () => {
    const blob = new Blob(["\uFEFF" + SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "wfmag_export_przyklad.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const newCount = preview.filter(r => r.status === "new").length;
  const updCount = preview.filter(r => r.status === "update").length;
  const unchCount = preview.filter(r => r.status === "unchanged").length;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">📥 Import CSV z WF-Mag</h1>
        <button className="btn btn-secondary btn-sm" onClick={downloadSample}>⬇️ Pobierz przykładowy CSV</button>
      </div>

      {/* Kroki */}
      <div className="step-indicator">
        {["1. Wgraj plik", "2. Mapowanie kolumn", "3. Podgląd zmian", "4. Wynik"].map((s, i) => (
          <div key={i} className={`step ${step === i + 1 ? "active" : step > i + 1 ? "done" : ""}`}>
            {step > i + 1 ? "✓ " : ""}{s}
          </div>
        ))}
      </div>

      {/* KROK 1 — Wgraj plik */}
      {step === 1 && (
        <div className="card">
          <div
            className={`csv-dropzone ${dragOver ? "drag-over" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
          >
            <div className="csv-dropzone-icon">📂</div>
            <div className="csv-dropzone-text">Przeciągnij plik CSV z WF-Mag lub kliknij aby wybrać</div>
            <div className="csv-dropzone-sub">Obsługiwany format: CSV z separatorem średnika (;) · kodowanie UTF-8 lub Windows-1250</div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: "none" }} onChange={handleFile} />
          </div>

          <div className="info-box mb-3">
            <strong>Jak wyeksportować CSV z WF-Mag?</strong><br />
            W programie WF-Mag: <strong>Kartoteki → Artykuły → F10 (Eksport)</strong> lub menu <strong>Raporty → Eksport do pliku</strong>.<br />
            Wybierz format CSV z separatorem średnika. Wymagane kolumny: <em>Indeks, Nazwa, Cena brutto, Stan magazynowy</em>.
          </div>

          <p className="form-label" style={{ marginBottom: 8 }}>Oczekiwany format pliku:</p>
          <div className="csv-format-hint">{`Indeks;Nazwa;Kategoria;Cena netto;Cena brutto;Stan magazynowy;Opis;Jednostka
LAP-001;Laptop Pro 15";Elektronika;4064,23;4999,00;12;Opis produktu;szt
SLU-002;Słuchawki Bluetooth;Elektronika;243,09;299,00;30;Opis produktu;szt`}</div>

          <button className="btn btn-secondary" onClick={downloadSample}>⬇️ Pobierz przykładowy plik CSV</button>
        </div>
      )}

      {/* KROK 2 — Mapowanie */}
      {step === 2 && rawData && (
        <div className="card">
          <div className="alert alert-success">✅ Wczytano plik: <strong>{fileName}</strong> — {rawData.length} wierszy, {csvHeaders.length} kolumn</div>

          <div className="encoding-box">
            <div className="flex items-center gap-2">
              <span>🔤 Wykryte kodowanie: <strong>{detectedEncoding === "windows-1250" ? "Windows-1250 (Środkowoeuropejskie)" : "UTF-8"}</strong></span>
            </div>
            <p className="text-sm text-muted" style={{ margin: "6px 0 10px" }}>
              Jeśli polskie znaki (ą, ę, ł, ż...) wyglądają niepoprawnie w podglądzie poniżej, zmień kodowanie ręcznie:
            </p>
            <div className="flex gap-2">
              <button className={`btn btn-sm ${encoding === "auto" ? "btn-primary" : "btn-secondary"}`} onClick={() => reparseWithEncoding("auto")}>Automatycznie</button>
              <button className={`btn btn-sm ${encoding === "windows-1250" ? "btn-primary" : "btn-secondary"}`} onClick={() => reparseWithEncoding("windows-1250")}>Windows-1250</button>
              <button className={`btn btn-sm ${encoding === "UTF-8" ? "btn-primary" : "btn-secondary"}`} onClick={() => reparseWithEncoding("UTF-8")}>UTF-8</button>
            </div>
          </div>

          <h3 className="card-title">Dopasuj kolumny CSV do pól sklepu</h3>
          <div className="info-box mb-3">
            System automatycznie dopasował kolumny. Sprawdź czy mapowanie jest poprawne i popraw jeśli trzeba.
          </div>
          <div className="mapping-grid">
            {FIELDS.map(f => (
              <div key={f.key} className="mapping-row">
                <span className="mapping-label">{f.label} {f.required && <span style={{ color: "var(--danger)" }}>*</span>}</span>
                <span className="mapping-arrow">→</span>
                <select className="form-select" style={{ flex: 1 }} value={mapping[f.key]} onChange={e => setMapping(m => ({ ...m, [f.key]: e.target.value }))}>
                  <option value="">— pomiń —</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mb-3">Podgląd pierwszego wiersza z CSV:</p>
          <div className="preview-table-wrap" style={{ maxHeight: 120 }}>
            <table className="preview-table">
              <thead><tr>{csvHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody><tr>{csvHeaders.map(h => <td key={h}>{String(rawData[0]?.[h] ?? "")}</td>)}</tr></tbody>
            </table>
          </div>
          <div className="card" style={{ background: "#f8fafc", border: "1px solid var(--border)", marginTop: 14 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Tryb importu</div>
            <div className="flex gap-3" style={{ flexWrap: "wrap" }}>
              <label className={`attr-tile ${importMode === "full" ? "active" : ""}`} style={{ cursor: "pointer" }}>
                <input type="radio" name="impmode" checked={importMode === "full"} onChange={() => setImportMode("full")} style={{ marginRight: 6 }} />📦 Pełny import produktów
              </label>
              <label className={`attr-tile ${importMode === "variants" ? "active" : ""}`} style={{ cursor: "pointer" }}>
                <input type="radio" name="impmode" checked={importMode === "variants"} onChange={() => setImportMode("variants")} style={{ marginRight: 6 }} />🧩 Import jako warianty
              </label>
              <label className={`attr-tile ${importMode === "prices" ? "active" : ""}`} style={{ cursor: "pointer" }}>
                <input type="radio" name="impmode" checked={importMode === "prices"} onChange={() => setImportMode("prices")} style={{ marginRight: 6 }} />💰 Aktualizacja cen (po SKU)
              </label>
            </div>

            {importMode === "variants" && (
              <div style={{ marginTop: 12 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 8 }}>Grupuje wiersze po prefiksie SKU w jeden produkt z wariantami (rozmiar wyciągany z nazwy). Import trafia do bufora (szkice).</div>
                <div className="mapping-row" style={{ marginBottom: 8 }}>
                  <span className="mapping-label">Grupuj po prefiksie SKU</span><span className="mapping-arrow">→</span>
                  <select className="form-select" style={{ flex: 1 }} value={prefixRule} onChange={e => setPrefixRule(e.target.value)}>
                    <option value="last">do ostatniego myślnika (WKR-CIES-6x40 → WKR-CIES)</option>
                    <option value="first">do pierwszego myślnika (WKR-6x40 → WKR)</option>
                    <option value="chars">pierwsze N znaków</option>
                  </select>
                </div>
                {prefixRule === "chars" && (
                  <div className="mapping-row" style={{ marginBottom: 8 }}>
                    <span className="mapping-label">Liczba znaków (N)</span><span className="mapping-arrow">→</span>
                    <input className="form-input" type="number" min="1" style={{ flex: 1 }} value={prefixN} onChange={e => setPrefixN(e.target.value)} />
                  </div>
                )}
                <div className="mapping-row" style={{ marginBottom: 8 }}>
                  <span className="mapping-label">Nazwa atrybutu wariantu</span><span className="mapping-arrow">→</span>
                  <input className="form-input" style={{ flex: 1 }} value={attrName} onChange={e => setAttrName(e.target.value)} placeholder="np. Rozmiar" />
                </div>
                <div className="mapping-row">
                  <span className="mapping-label">Ceny w pliku to</span><span className="mapping-arrow">→</span>
                  <select className="form-select" style={{ flex: 1 }} value={priceType} onChange={e => setPriceType(e.target.value)}>
                    <option value="netto">netto (warianty trzymają netto)</option>
                    <option value="brutto">brutto (przeliczę na netto)</option>
                  </select>
                </div>
              </div>
            )}

            {importMode === "prices" && (
              <div style={{ marginTop: 12 }}>
                <div className="text-sm text-muted" style={{ marginBottom: 8 }}>Dopasuje wiersze do istniejących produktów <strong>i wariantów po SKU</strong> i zmieni tylko cenę. Reszta danych produktu pozostaje bez zmian. Potrzebne kolumny: <strong>SKU</strong> i <strong>cena</strong> (mapowanie wyżej).</div>
                <div className="mapping-row">
                  <span className="mapping-label">Ceny w pliku to</span><span className="mapping-arrow">→</span>
                  <select className="form-select" style={{ flex: 1 }} value={priceType} onChange={e => setPriceType(e.target.value)}>
                    <option value="netto">netto</option>
                    <option value="brutto">brutto</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" onClick={importMode === "variants" ? buildVariantPreview : importMode === "prices" ? buildPricePreview : buildPreview}>Dalej: Podgląd zmian →</button>
            <button className="btn btn-secondary" onClick={reset}>← Wróć</button>
          </div>
        </div>
      )}

      {/* KROK 3 — Podgląd */}
      {step === 3 && importMode === "variants" && (
        <div className="card">
          <h3 className="card-title">Podgląd grupowania — sprawdź zanim zaimportujesz</h3>
          <div className="info-box mb-3">
            Pogrupowano <strong>{rawData?.length || 0}</strong> wierszy w <strong>{grouped.length}</strong> {grouped.length === 1 ? "produkt" : "produktów"}.
            Sprawdź, czy <strong>nazwy bazowe</strong> i <strong>rozmiary</strong> wyglądają poprawnie. Jeśli nie — wróć i zmień regułę prefiksu SKU.
            Produkty trafią do <strong>bufora (szkice)</strong> — opublikujesz je po sprawdzeniu.
          </div>
          {pendingNewUnits.length > 0 && (
            <div className="encoding-box" style={{ marginBottom: 14 }}>📏 Nowe jednostki do założenia: {pendingNewUnits.map(u => u.label).join(", ")}</div>
          )}
          <div className="preview-table-wrap" style={{ maxHeight: 420 }}>
            <table className="preview-table">
              <thead><tr><th>Status</th><th>SKU (grupa)</th><th>Nazwa produktu</th><th>Kategoria</th><th>Warianty ({attrName})</th><th>Stan łącznie</th></tr></thead>
              <tbody>
                {grouped.map((g, i) => (
                  <tr key={i}>
                    <td><span className={`badge ${g.status === "new" ? "badge-green" : "badge-orange"}`}>{g.status === "new" ? "nowy" : "aktualizacja"}</span></td>
                    <td className="text-sm"><strong>{g.key}</strong></td>
                    <td>{g.baseName}{g.single && <span className="badge badge-gray" style={{ marginLeft: 6 }}>bez wariantów</span>}</td>
                    <td className="text-sm text-muted">{g.category}</td>
                    <td className="text-sm">{g.single ? "—" : g.attributeGroups[0]?.values.join(", ")}</td>
                    <td>{g.totalStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" onClick={doVariantImport} disabled={grouped.length === 0}>✅ Importuj {grouped.length} do bufora</button>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Wróć do ustawień</button>
          </div>
        </div>
      )}

      {/* KROK 3 — Podgląd cen (po SKU) */}
      {step === 3 && importMode === "prices" && (
        <div className="card">
          <h3 className="card-title">Podgląd zmian cen — dopasowano po SKU</h3>
          <div className="info-box mb-3">
            Dopasowano <strong>{pricePreview.length}</strong> {pricePreview.length === 1 ? "pozycję" : "pozycji"} do zmiany.
            {priceUnmatched.length > 0 && <> Z pliku <strong>{priceUnmatched.length}</strong> SKU nie pasuje do żadnego produktu/wariantu (pominięte).</>}
          </div>
          {pricePreview.length === 0 ? (
            <div className="empty-state"><div className="icon">💰</div>Brak zmian — żaden SKU z pliku nie pasuje, albo ceny są już aktualne.</div>
          ) : (
            <div className="preview-table-wrap" style={{ maxHeight: 420 }}>
              <table className="preview-table">
                <thead><tr><th>Typ</th><th>SKU</th><th>Produkt / wariant</th><th>Cena teraz</th><th>Nowa cena</th></tr></thead>
                <tbody>
                  {pricePreview.map((m, i) => (
                    <tr key={i}>
                      <td><span className={`badge ${m.type === "variant" ? "badge-blue" : "badge-gray"}`}>{m.type === "variant" ? "wariant" : "produkt"}</span></td>
                      <td className="text-sm" style={{ fontFamily: "monospace" }}>{m.sku}</td>
                      <td>{m.name}</td>
                      <td className="text-sm text-muted">{m.type === "variant" ? `${fmt(m.oldNet)} netto` : `${fmt(m.oldGross)} brutto`}</td>
                      <td className="font-bold">{m.type === "variant" ? `${fmt(m.newNet)} netto` : `${fmt(m.newGross)} brutto`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {priceUnmatched.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary className="text-sm text-muted" style={{ cursor: "pointer" }}>Pokaż {priceUnmatched.length} niedopasowanych SKU z pliku</summary>
              <div className="text-sm text-muted" style={{ marginTop: 6, fontFamily: "monospace", maxHeight: 120, overflow: "auto" }}>{priceUnmatched.join(", ")}</div>
            </details>
          )}
          <div className="flex gap-3 mt-4">
            <button className="btn btn-primary" onClick={doPriceImport} disabled={pricePreview.length === 0}>💰 Zaktualizuj {pricePreview.length} cen</button>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Wróć do ustawień</button>
          </div>
        </div>
      )}

      {/* KROK 3 — Podgląd */}
      {step === 3 && importMode === "full" && (
        <div className="card">
          <h3 className="card-title">Podgląd zmian</h3>
          <div className="changes-summary">
            <div className="change-card c-new"><div className="num">{newCount}</div><div className="lbl">Nowe produkty</div></div>
            <div className="change-card c-upd"><div className="num">{updCount}</div><div className="lbl">Aktualizacje</div></div>
            <div className="change-card c-unch"><div className="num">{unchCount}</div><div className="lbl">Bez zmian</div></div>
          </div>

          {pendingNewUnits.length > 0 && (
            <div className="encoding-box" style={{ marginBottom: 18 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                <span>📏 Wykryto {pendingNewUnits.length} {pendingNewUnits.length === 1 ? "nową jednostkę miary" : "nowe jednostki miary"} — zostaną automatycznie założone:</span>
              </div>
              <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                {pendingNewUnits.map(u => <span key={u.value} className="tag tag-sub">{u.label} ({u.value})</span>)}
              </div>
            </div>
          )}

          <div className="import-legend">
            <span><span className="legend-dot" style={{ background: "#22c55e" }}></span>Nowy produkt</span>
            <span><span className="legend-dot" style={{ background: "#f59e0b" }}></span>Aktualizacja ceny/stanu</span>
            <span><span className="legend-dot" style={{ background: "#e5e7eb" }}></span>Bez zmian</span>
          </div>
          <div className="preview-table-wrap">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Status</th><th>Indeks</th><th>Nazwa</th><th>Kategoria</th>
                  <th>Cena CSV</th><th>Cena bieżąca</th><th>Stan CSV</th><th>Stan bieżący</th><th>Jednostka</th>
                </tr>
              </thead>
              <tbody>
                {preview.map(row => (
                  <tr key={row.idx} className={`row-${row.status}`}>
                    <td>
                      {row.status === "new" && <span className="badge badge-green">+ Nowy</span>}
                      {row.status === "update" && <span className="badge badge-yellow">↻ Update</span>}
                      {row.status === "unchanged" && <span className="badge badge-gray">= OK</span>}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: ".78rem" }}>{row.sku}</td>
                    <td>{row.name}</td>
                    <td><span className="tag">{row.category}</span></td>
                    <td style={{ fontWeight: 700, color: row.existing && row.existing.price !== row.price ? "var(--warning)" : "inherit" }}>{fmt(row.price)}</td>
                    <td className="text-muted">{row.existing ? fmt(row.existing.price) : "—"}</td>
                    <td style={{ fontWeight: 700, color: row.existing && row.existing.stock !== row.stock ? "var(--warning)" : "inherit" }}>{row.stock}</td>
                    <td className="text-muted">{row.existing ? row.existing.stock : "—"}</td>
                    <td>
                      {row.unitIsNew
                        ? <span className="tag tag-sub" title="Nowa jednostka — zostanie założona">{row.unit} 🆕</span>
                        : <span className="text-sm text-muted">{units.find(u => u.value === row.unit)?.label || row.unit}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn btn-success" onClick={doImport} disabled={newCount + updCount === 0}>
              ✅ Importuj {newCount + updCount > 0 ? `(${newCount + updCount} zmian)` : "— brak zmian"}
            </button>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Popraw mapowanie</button>
            <button className="btn btn-secondary" onClick={reset}>✕ Anuluj</button>
          </div>
        </div>
      )}

      {/* KROK 4 — Wynik */}
      {step === 4 && result && (
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 20 }}>Import zakończony pomyślnie!</h2>
          <div className="changes-summary" style={{ maxWidth: 400, margin: "0 auto 24px" }}>
            <div className="change-card c-new"><div className="num">{result.added}</div><div className="lbl">Nowe produkty</div></div>
            <div className="change-card c-upd"><div className="num">{result.updated}</div><div className="lbl">Zaktualizowane</div></div>
            <div className="change-card c-unch"><div className="num">{result.unchanged}</div><div className="lbl">Bez zmian</div></div>
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: 8 }}>Plik: <strong>{fileName}</strong> · {result.total} wierszy przetworzonych</p>
          {result.newUnits > 0 && <p className="text-sm" style={{ color: "var(--primary)", fontWeight: 600, marginBottom: 20 }}>📏 Założono {result.newUnits} {result.newUnits === 1 ? "nową jednostkę miary" : "nowe jednostki miary"}</p>}
          <div className="flex gap-3 items-center" style={{ justifyContent: "center" }}>
            <button className="btn btn-primary" onClick={reset}>📥 Importuj kolejny plik</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── ADMIN PRODUKTY ────────────────────────────────────────────────────────────
// ── Rekurencyjny węzeł drzewa podkategorii (nieograniczona głębokość) ────────
const SUBCAT_TAG_COLORS = ["tag-sub", "tag-subsub", "tag-subsubsub"];

function SubcatTreeNode({ node, catName, depth, products, newSub, setNewSub, addSubcategory, removeSubcategory }) {
  const children = Object.values(node.children);
  const count = products.filter(p => p.category === catName && p.subcategory === node.fullPath).length;
  const tagClass = SUBCAT_TAG_COLORS[Math.min(depth, SUBCAT_TAG_COLORS.length - 1)];
  const prefix = depth === 0 ? "" : "↳ ".repeat(1);
  const label = depth === 0 ? node.name : `${prefix}${node.name}`;

  return (
    <div className="subcat-tree-node" style={{ marginLeft: depth * 18 }}>
      <div className="flex gap-2 items-center" style={{ marginBottom: 6 }}>
        <span className={`tag ${tagClass}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 6px 5px 10px" }}>
          {label} <span className="text-muted">({count})</span>
          <button onClick={() => removeSubcategory(catName, node.fullPath)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontWeight: 700, padding: "0 3px" }} title="Usuń (i wszystkie jej dzieci)">✕</button>
        </span>
      </div>

      {children.length > 0 && (
        <div className="subcat-children">
          {children.map(child => (
            <SubcatTreeNode
              key={child.fullPath}
              node={child}
              catName={catName}
              depth={depth + 1}
              products={products}
              newSub={newSub}
              setNewSub={setNewSub}
              addSubcategory={addSubcategory}
              removeSubcategory={removeSubcategory}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-3" style={{ marginLeft: 18 }}>
        <input className="form-input" style={{ fontSize: ".8rem" }} placeholder={`Nowa podkategoria w "${node.fullPath}"`}
          value={newSub[`${catName}::${node.fullPath}`] || ""} onChange={e => setNewSub(prev => ({ ...prev, [`${catName}::${node.fullPath}`]: e.target.value }))}
          onKeyDown={e => e.key === "Enter" && addSubcategory(catName, node.fullPath)} />
        <button className="btn btn-secondary btn-sm" onClick={() => addSubcategory(catName, node.fullPath)}>+ Dodaj</button>
      </div>
    </div>
  );
}

function AdminProducts({ products, setProducts, categories, setCategories, units, setUnits, showAlert, modal, setModal, editItem, setEditItem }) {
  const [form, setForm] = useState({ name: "", category: categories[0]?.name || "", subcategory: "", price: "", promoPrice: "", stock: "", weight: "", unit: "szt", image: "📦", photo: "", description: "", longDescription: "", specs: [], sku: "", attributeGroups: [], variants: [], published: false });
  const [newCat, setNewCat] = useState("");
  const [delTarget, setDelTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allVisibleIds = products.map(p => p.id);
  const allSelected = products.length > 0 && selectedIds.length === products.length;
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : allVisibleIds);
  const [newUnitValue, setNewUnitValue] = useState("");
  const [newUnitLabel, setNewUnitLabel] = useState("");
  const [newSub, setNewSub] = useState({});
  const [catFilter, setCatFilter] = useState(categories[0]?.name || "");
  const emojis = ["📦", "💻", "🎧", "📱", "👕", "👟", "🍕", "☕", "📘", "🎒", "⌚", "🏋️", "🎮", "🌿"];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showAlert("Wybierz plik graficzny (JPG, PNG)", "danger");
    if (file.size > 2 * 1024 * 1024) return showAlert("Plik jest większy niż 2 MB — wybierz mniejsze zdjęcie", "danger");
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, photo: reader.result }));
    reader.onerror = () => showAlert("Nie udało się wczytać zdjęcia", "danger");
    reader.readAsDataURL(file);
  };

  const openAdd = () => { setForm({ name: "", category: categories[0]?.name || "", subcategory: "", price: "", promoPrice: "", stock: "", weight: "", unit: "szt", image: "📦", photo: "", description: "", longDescription: "", specs: [], sku: "", attributeGroups: [], variants: [], published: false }); setEditItem(null); setModal("product"); };
  const openEdit = (p) => {
    const groups = Array.isArray(p.attributeGroups) ? p.attributeGroups.map(g => ({ id: g.id || `g_${Math.random().toString(36).slice(2)}`, name: g.name || "", values: [...(g.values || [])] })) : [];
    const vars = Array.isArray(p.variants) ? p.variants.map(v => ({ id: v.id, combo: { ...(v.combo || {}) }, price: String(v.price ?? ""), sku: v.sku || "", weight: String(v.weight ?? "") })) : [];
    setForm({ ...p, subcategory: p.subcategory || "", price: String(p.price), promoPrice: p.promoPrice != null ? String(p.promoPrice) : "", stock: String(p.stock), weight: String(p.weight || ""), unit: p.unit || "szt", photo: p.photo || "", longDescription: p.longDescription || "", specs: p.specs || [], attributeGroups: groups, variants: vars });
    setEditItem(p); setModal("product");
  };
  const save = async () => {
    if (!form.name) return showAlert("Podaj nazwę produktu", "danger");
    if (!form.category) return showAlert("Wybierz kategorię", "danger");

    // Warianty (styl Allegro): grupy atrybutów + kombinacje z ceną NETTO.
    const cleanGroups = (form.attributeGroups || [])
      .map(g => ({ id: g.id, name: (g.name || "").trim(), values: (g.values || []).map(v => String(v).trim()).filter(Boolean) }))
      .filter(g => g.name && g.values.length);
    let cleanVariants = [];
    if (cleanGroups.length) {
      for (let i = 0; i < (form.variants || []).length; i++) {
        const v = form.variants[i];
        const price = +v.price || 0; // cena NETTO wariantu
        const combo = {};
        for (const g of cleanGroups) {
          const val = v.combo?.[g.name];
          if (!val) return showAlert(`Wariant ${i + 1}: wybierz wartość dla „${g.name}”`, "danger");
          combo[g.name] = val;
        }
        if (price <= 0) return showAlert(`Wariant ${i + 1}: cena netto musi być większa od 0`, "danger");
        cleanVariants.push({ id: v.id || `v_${Date.now()}_${i}`, combo, price, sku: v.sku || "", weight: +v.weight || 0 });
      }
    }

    const usingVariants = cleanGroups.length > 0;
    let basePrice, promoVal;
    if (usingVariants) {
      // Cena ustalana wyłącznie w wariantach. Cena produktu = brutto najtańszego
      // wariantu (netto × 1,23). Promocja nie dotyczy produktów z wariantami.
      if (!cleanVariants.length) return showAlert("Dodaj przynajmniej jeden wariant z ceną netto", "danger");
      const minNet = Math.min(...cleanVariants.map(v => v.price));
      basePrice = grossOf(minNet);
      promoVal = null;
    } else {
      if (!form.price) return showAlert("Podaj cenę brutto", "danger");
      promoVal = form.promoPrice === "" || form.promoPrice == null ? null : +form.promoPrice;
      if (promoVal != null && (isNaN(promoVal) || promoVal <= 0)) return showAlert("Cena promocyjna musi być liczbą większą od 0 (lub puste pole)", "danger");
      if (promoVal != null && promoVal >= +form.price) return showAlert("Cena promocyjna musi być niższa od ceny regularnej", "danger");
      basePrice = +form.price;
    }

    const payload = {
      sku: form.sku, name: form.name, category: form.category, subcategory: form.subcategory,
      description: form.description, price: basePrice, promo_price: promoVal, stock: +form.stock, weight: +form.weight || 0,
      unit: form.unit, image: form.image, photo: form.photo,
      long_description: form.longDescription, specs: form.specs,
      attribute_groups: cleanGroups,
      variants: cleanVariants,
      published: !!form.published,
    };
    try {
      if (editItem) {
        const updated = await api.updateProduct(editItem.id, payload);
        setProducts(prev => prev.map(p => p.id === editItem.id ? { ...form, id: editItem.id, price: basePrice, promoPrice: promoVal, stock: +form.stock, weight: +form.weight || 0, attributeGroups: cleanGroups, variants: cleanVariants, published: !!form.published } : p));
      } else {
        const created = await api.addProduct(payload);
        setProducts(prev => [...prev, { ...form, id: created.id, price: basePrice, promoPrice: promoVal, stock: +form.stock, weight: +form.weight || 0, attributeGroups: cleanGroups, variants: cleanVariants, published: !!form.published }]);
      }
      showAlert(editItem ? (form.published ? "Produkt zaktualizowany" : "Zapisano jako szkic") : (form.published ? "Produkt dodany i opublikowany" : "Produkt zapisany w buforze (szkic)")); setModal(null);
    } catch (err) {
      showAlert("Nie udało się zapisać do bazy danych: " + err.message, "danger");
    }
  };

  const currentSubcats = (categories.find(c => c.name === form.category)?.subcategories) || [];

  const addCategory = async () => {
    const name = newCat.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) return showAlert("Taka kategoria już istnieje", "danger");
    try {
      const created = await api.addCategory(name);
      setCategories(prev => [...prev, { id: created.id, name, subcategories: [] }]);
      setNewCat("");
      showAlert(`Kategoria "${name}" dodana`);
    } catch (err) {
      showAlert("Nie udało się zapisać kategorii: " + err.message, "danger");
    }
  };

  const removeCategory = async (catName) => {
    const inUse = products.filter(p => p.category === catName).length;
    if (inUse > 0) return showAlert(`Nie można usunąć — ${inUse} produktów ma tę kategorię`, "danger");
    const cat = categories.find(c => c.name === catName);
    try {
      if (cat?.id) await api.deleteCategory(cat.id);
      setCategories(prev => prev.filter(c => c.name !== catName));
      if (catFilter === catName) setCatFilter("");
      showAlert(`Kategoria "${catName}" usunięta`);
    } catch (err) {
      showAlert("Nie udało się usunąć kategorii: " + err.message, "danger");
    }
  };

  const addSubcategory = async (catName, parentSub = null) => {
    const inputKey = parentSub ? `${catName}::${parentSub}` : catName;
    const raw = (newSub[inputKey] || "").trim();
    if (!raw) return;
    const sub = parentSub ? `${parentSub} / ${raw}` : raw;
    const cat = categories.find(c => c.name === catName);
    if (cat.subcategories.some(s => s.toLowerCase() === sub.toLowerCase())) return showAlert("Taka podkategoria już istnieje", "danger");
    try {
      if (cat?.id) await api.addSubcategory(cat.id, cat.subcategories, sub);
      setCategories(prev => prev.map(c => c.name === catName ? { ...c, subcategories: [...c.subcategories, sub] } : c));
      setNewSub(prev => ({ ...prev, [inputKey]: "" }));
      showAlert(parentSub ? `Podkategoria "${raw}" dodana do "${parentSub}"` : `Podkategoria "${sub}" dodana do "${catName}"`);
    } catch (err) {
      showAlert("Nie udało się zapisać podkategorii: " + err.message, "danger");
    }
  };

  const removeSubcategory = async (catName, sub) => {
    // Usunięcie podkategorii usuwa też wszystkie jej dzieci (np. "Wkręty" usuwa "Wkręty / Do drewna")
    const cat = categories.find(c => c.name === catName);
    const toRemove = cat.subcategories.filter(s => s === sub || s.startsWith(sub + " / "));
    const inUse = products.filter(p => p.category === catName && toRemove.includes(p.subcategory)).length;
    if (inUse > 0) return showAlert(`Nie można usunąć — ${inUse} produktów ma tę podkategorię (lub jej pod-podkategorię)`, "danger");
    try {
      const remaining = cat.subcategories.filter(s => !toRemove.includes(s));
      if (cat?.id) {
        for (const s of toRemove) await api.removeSubcategory(cat.id, cat.subcategories, s);
      }
      setCategories(prev => prev.map(c => c.name === catName ? { ...c, subcategories: remaining } : c));
      showAlert(`Podkategoria "${sub}" usunięta`);
    } catch (err) {
      showAlert("Nie udało się usunąć podkategorii: " + err.message, "danger");
    }
  };

  // Budowanie drzewa podkategorii z płaskiej listy stringów typu "A / B / C / ..."
  // Wsparcie dla nieograniczonej głębokości zagnieżdżenia.
  const buildSubcatTree = (subcats) => {
    const root = {};
    subcats.forEach(full => {
      const parts = full.split(" / ");
      let node = root;
      let pathSoFar = "";
      parts.forEach((part, i) => {
        pathSoFar = pathSoFar ? `${pathSoFar} / ${part}` : part;
        if (!node[part]) node[part] = { name: part, fullPath: pathSoFar, children: {} };
        node = node[part].children;
      });
    });
    return root;
  };

  const addUnit = () => {
    const value = newUnitValue.trim().toLowerCase();
    const label = newUnitLabel.trim();
    if (!value || !label) return showAlert("Podaj symbol i nazwę jednostki", "danger");
    if (units.some(u => u.value === value)) return showAlert("Jednostka z tym symbolem już istnieje", "danger");
    setUnits(prev => [...prev, { value, label }]);
    setNewUnitValue(""); setNewUnitLabel("");
    showAlert(`Jednostka "${label}" dodana`);
  };

  const removeUnit = (value) => {
    const inUse = products.filter(p => p.unit === value).length;
    if (inUse > 0) return showAlert(`Nie można usunąć — ${inUse} produktów używa tej jednostki`, "danger");
    setUnits(prev => prev.filter(u => u.value !== value));
    showAlert("Jednostka usunięta");
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">📦 Produkty</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => setModal("categories")}>🏷️ Zarządzaj kategoriami</button>
          <button className="btn btn-primary" onClick={openAdd}>+ Dodaj produkt</button>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{products.length}</div><div className="stat-label">Produktów</div></div>
        <div className="stat-card"><div className="stat-value">{products.reduce((s, p) => s + p.stock, 0)}</div><div className="stat-label">Sztuk w magazynie</div></div>
        <div className="stat-card"><div className="stat-value">{categories.length}</div><div className="stat-label">Kategorii</div></div>
        <div className="stat-card"><div className="stat-value">{categories.reduce((s, c) => s + c.subcategories.length, 0)}</div><div className="stat-label">Podkategorii</div></div>
      </div>
      <div className="card">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3" style={{ padding: "10px 14px", marginBottom: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, flexWrap: "wrap" }}>
            <strong>Zaznaczono: {selectedIds.length}</strong>
            <button className="btn btn-danger btn-sm" onClick={() => setBulkConfirm(true)}>🗑️ Usuń zaznaczone ({selectedIds.length})</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedIds([])}>Wyczyść zaznaczenie</button>
          </div>
        )}
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th style={{ width: 36 }}><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} title="Zaznacz wszystkie" style={{ width: 16, height: 16 }} /></th>
              <th>SKU</th><th>Produkt</th><th>Kategoria</th><th>Podkategoria</th><th>Cena</th><th>Waga</th><th>Magazyn</th><th>Akcje</th></tr></thead>
            <tbody>{products.map(p => (
              <tr key={p.id} style={selectedIds.includes(p.id) ? { background: "#fef2f2" } : undefined}>
                <td><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 16, height: 16 }} /></td>
                <td style={{ fontFamily: "monospace", fontSize: ".78rem", color: "var(--muted)" }}>{p.sku || "—"}</td>
                <td>
                  {p.photo
                    ? <img src={p.photo} alt={p.name} className="product-photo-thumb" />
                    : <span style={{ fontSize: "1.2rem", marginRight: 7 }}>{p.image}</span>}
                  <strong>{p.name}</strong>
                </td>
                <td><span className="badge badge-blue">{p.category}</span></td>
                <td>{p.subcategory ? <span className="badge badge-gray">{p.subcategory}</span> : <span className="text-muted text-sm">—</span>}</td>
                <td className="font-bold" style={{ color: "var(--primary)" }}>
                  {hasPromo(p) ? <>
                    <span style={{ textDecoration: "line-through", color: "var(--muted)", fontWeight: 400, fontSize: ".8rem" }}>{fmt(p.price)}</span>{" "}
                    <span style={{ color: "#dc2626" }}>{fmt(p.promoPrice)}</span>
                  </> : fmt(p.price)}
                </td>
                <td className="text-sm text-muted">{p.weight ? `${p.weight} kg` : "—"}</td>
                <td><span className={`badge ${p.stock > 10 ? "badge-green" : p.stock > 0 ? "badge-orange" : "badge-red"}`}>{p.stock} {units.find(u => u.value === p.unit)?.label || "szt."}</span></td>
                <td><div className="flex gap-2 items-center" style={{ flexWrap: "wrap" }}>
                  {p.published !== false
                    ? <span className="badge badge-green">✅ Opublikowany</span>
                    : <span className="badge badge-orange">📝 Szkic</span>}
                  <button className="btn btn-secondary btn-sm" title={p.published !== false ? "Ukryj (przenieś do bufora)" : "Opublikuj w sklepie"} onClick={async () => {
                    const next = !(p.published !== false);
                    try {
                      await api.setProductPublished(p.id, next);
                      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, published: next } : x));
                      showAlert(next ? "Opublikowano w sklepie" : "Przeniesiono do bufora (szkic)");
                    } catch (err) {
                      showAlert("Nie udało się zmienić statusu: " + err.message, "danger");
                    }
                  }}>{p.published !== false ? "🙈 Ukryj" : "🚀 Opublikuj"}</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDelTarget(p)}>🗑️</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>

      {modal === "product" && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">{editItem ? "Edytuj produkt" : "Nowy produkt"}</h2><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Zdjęcie produktu</label>
                <div className="photo-upload-row">
                  <div className="photo-preview">
                    {form.photo ? <img src={form.photo} alt="podgląd" /> : <span style={{ fontSize: "2.2rem" }}>{form.image}</span>}
                  </div>
                  <div className="flex gap-2" style={{ flexDirection: "column" }}>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", width: "fit-content" }}>
                      📷 {form.photo ? "Zmień zdjęcie" : "Wgraj zdjęcie"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
                    </label>
                    {form.photo && <button type="button" className="btn btn-danger btn-sm" style={{ width: "fit-content" }} onClick={() => setForm(f => ({ ...f, photo: "" }))}>🗑️ Usuń zdjęcie</button>}
                    <span className="text-sm text-muted">JPG/PNG, max 2 MB. Bez zdjęcia produkt wyświetli ikonę.</span>
                  </div>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Ikona (gdy brak zdjęcia)</label>
                <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                  {emojis.map(e => <button key={e} onClick={() => setForm(f => ({ ...f, image: e }))} style={{ fontSize: "1.4rem", padding: "5px 9px", borderRadius: 8, border: `2px solid ${form.image === e ? "var(--primary)" : "var(--border)"}`, background: form.image === e ? "var(--primary-light)" : "#fff", cursor: "pointer" }}>{e}</button>)}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 2 }}><label className="form-label">Nazwa *</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">SKU / Indeks</label><input className="form-input" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Kategoria *</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: "" }))}>
                    <option value="">— wybierz —</option>
                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Podkategoria</label>
                  <select className="form-select" value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))} disabled={!form.category || currentSubcats.length === 0}>
                    <option value="">— brak —</option>
                    {currentSubcats.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button type="button" className="btn btn-secondary btn-sm w-full" style={{ marginTop: -6, marginBottom: 14 }} onClick={() => setModal("categories")}>🏷️ Zarządzaj kategoriami i podkategoriami</button>
              <div className="form-group"><label className="form-label">Opis (krótki, widoczny na karcie produktu)</label><input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>

              <div className="form-group">
                <label className="form-label">Rozszerzony opis (strona produktu)</label>
                <RichTextEditor
                  value={form.longDescription}
                  onChange={html => setForm(f => ({ ...f, longDescription: html }))}
                  placeholder="Opisz produkt szerzej — możesz formatować tekst, zmieniać kolory i wstawiać obrazy..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specyfikacja techniczna</label>
                {form.specs.map((row, i) => (
                  <div key={i} className="spec-row-editor">
                    <input className="form-input" placeholder="Parametr (np. Materiał)" value={row.key}
                      onChange={e => setForm(f => ({ ...f, specs: f.specs.map((s, si) => si === i ? { ...s, key: e.target.value } : s) }))} />
                    <input className="form-input" placeholder="Wartość (np. Stal nierdzewna)" value={row.value}
                      onChange={e => setForm(f => ({ ...f, specs: f.specs.map((s, si) => si === i ? { ...s, value: e.target.value } : s) }))} />
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, specs: f.specs.filter((_, si) => si !== i) }))}>✕</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }))}>+ Dodaj parametr</button>
              </div>

              <div className="flex gap-3">
                {!((form.attributeGroups || []).some(g => (g.name || "").trim() && (g.values || []).length)) ? (
                  <>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Cena brutto *</label><input className="form-input" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} /></div>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Cena promocyjna</label><input className="form-input" type="number" step="0.01" min="0" placeholder="puste = brak promocji" value={form.promoPrice} onChange={e => setForm(f => ({ ...f, promoPrice: e.target.value }))} /></div>
                  </>
                ) : (
                  <div className="form-group" style={{ flex: 2 }}><label className="form-label">Cena</label><div className="form-input" style={{ background: "#f8fafc", color: "var(--muted)", display: "flex", alignItems: "center" }}>Ustalana w wariantach (netto) — sekcja „🧩 Warianty" poniżej</div></div>
                )}
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Stan magazynowy</label><input className="form-input" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} /></div>
              </div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Jednostka miary</label>
                  <div className="flex gap-2">
                    <select className="form-select" style={{ flex: 1 }} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                      {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal("units")} title="Zarządzaj jednostkami">📏 +</button>
                  </div>
                </div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Waga (kg)</label><input className="form-input" type="number" step="0.01" min="0" placeholder="np. 1.5" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} /></div>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 6 }}>
                <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>🧩 Warianty (np. długość, średnica)</label>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, attributeGroups: [...(f.attributeGroups || []), { id: `g_${Date.now()}`, name: "", values: [] }] }))}>+ Dodaj grupę</button>
                </div>
                <p className="text-sm text-muted" style={{ marginTop: 0, marginBottom: 10 }}>Najpierw zdefiniuj grupy i ich wartości (kafelki), potem dodaj warianty z ceną dla konkretnych kombinacji. Zostaw puste, jeśli produkt nie ma wariantów.</p>

                {/* Edytor grup atrybutów */}
                {(form.attributeGroups || []).map((g, gi) => (
                  <div key={g.id || gi} style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                    <div className="flex gap-2 items-center" style={{ marginBottom: 8 }}>
                      <input className="form-input" style={{ flex: 1 }} placeholder="Nazwa grupy (np. Długość)" value={g.name}
                        onChange={e => setForm(f => { const ag = [...f.attributeGroups]; ag[gi] = { ...ag[gi], name: e.target.value }; return { ...f, attributeGroups: ag }; })} />
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, attributeGroups: f.attributeGroups.filter((_, j) => j !== gi) }))}>🗑️ grupa</button>
                    </div>
                    <div className="flex gap-2 items-center" style={{ flexWrap: "wrap", marginBottom: 6 }}>
                      {(g.values || []).map((val, vi) => (
                        <span key={vi} className="badge badge-blue" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          {val}
                          <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setForm(f => { const ag = [...f.attributeGroups]; ag[gi] = { ...ag[gi], values: ag[gi].values.filter((_, j) => j !== vi) }; return { ...f, attributeGroups: ag }; })}>×</span>
                        </span>
                      ))}
                      {(g.values || []).length === 0 && <span className="text-sm text-muted">Brak wartości — dodaj poniżej</span>}
                    </div>
                    <input className="form-input" placeholder="Wpisz wartość i naciśnij Enter (np. 40 mm)"
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const val = e.target.value.trim(); if (val) { setForm(f => { const ag = [...f.attributeGroups]; if (!ag[gi].values.includes(val)) ag[gi] = { ...ag[gi], values: [...ag[gi].values, val] }; return { ...f, attributeGroups: ag }; }); e.target.value = ""; } } }} />
                  </div>
                ))}

                {/* Edytor wariantów */}
                {(form.attributeGroups || []).filter(g => (g.name || "").trim() && (g.values || []).length).length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div className="flex items-center" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                      <label className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>Warianty (kombinacje z ceną)</label>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, variants: [...(f.variants || []), { id: `v_${Date.now()}`, combo: {}, price: "", sku: "", weight: "" }] }))}>+ Dodaj wariant</button>
                    </div>
                    {(form.variants || []).map((v, vi) => (
                      <div key={v.id || vi} className="flex gap-2 items-center" style={{ marginBottom: 8, flexWrap: "wrap" }}>
                        {(form.attributeGroups || []).filter(g => (g.name || "").trim() && (g.values || []).length).map(g => (
                          <select key={g.id || g.name} className="form-select" style={{ flex: "1 1 110px", padding: "6px 8px" }} value={v.combo?.[g.name] || ""}
                            onChange={e => setForm(f => { const vs = [...f.variants]; vs[vi] = { ...vs[vi], combo: { ...vs[vi].combo, [g.name]: e.target.value } }; return { ...f, variants: vs }; })}>
                            <option value="">{g.name}…</option>
                            {g.values.map(val => <option key={val} value={val}>{val}</option>)}
                          </select>
                        ))}
                        <input className="form-input" style={{ flex: "1 1 70px" }} type="number" step="0.01" min="0" placeholder="Cena netto" value={v.price}
                          onChange={e => setForm(f => { const vs = [...f.variants]; vs[vi] = { ...vs[vi], price: e.target.value }; return { ...f, variants: vs }; })} />
                        <input className="form-input" style={{ flex: "1 1 70px" }} placeholder="SKU" value={v.sku}
                          onChange={e => setForm(f => { const vs = [...f.variants]; vs[vi] = { ...vs[vi], sku: e.target.value }; return { ...f, variants: vs }; })} />
                        <input className="form-input" style={{ flex: "1 1 60px" }} type="number" step="0.001" min="0" placeholder="Waga" value={v.weight}
                          onChange={e => setForm(f => { const vs = [...f.variants]; vs[vi] = { ...vs[vi], weight: e.target.value }; return { ...f, variants: vs }; })} />
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, j) => j !== vi) }))}>🗑️</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, padding: "12px 14px", background: form.published ? "#ecfdf5" : "#fff7ed", border: `1px solid ${form.published ? "#a7f3d0" : "#fed7aa"}`, borderRadius: 8 }}>
                <label className="flex items-center gap-3" style={{ cursor: "pointer", margin: 0 }}>
                  <input type="checkbox" checked={!!form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} style={{ width: 18, height: 18 }} />
                  <span>
                    <strong>{form.published ? "✅ Opublikowany — widoczny w sklepie" : "📝 Szkic (bufor) — niewidoczny dla klientów"}</strong>
                    <div className="text-sm text-muted">{form.published ? "Produkt jest dostępny dla klientów." : "Zaznacz, aby udostępnić produkt w sklepie. Możesz też opublikować go później z listy produktów."}</div>
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>💾 {editItem ? "Zapisz" : (form.published ? "Dodaj" : "Zapisz w buforze")}</button>
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "categories" && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-header"><h2 className="modal-title">🏷️ Zarządzanie kategoriami i podkategoriami</h2><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nowa kategoria główna</label>
                <div className="flex gap-2">
                  <input className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="np. Odzież" onKeyDown={e => e.key === "Enter" && addCategory()} />
                  <button className="btn btn-primary btn-sm" onClick={addCategory}>+ Dodaj kategorię</button>
                </div>
              </div>
              <div className="divider"></div>
              <p className="form-label mb-3">Kategorie i ich podkategorie:</p>

              {categories.length === 0
                ? <p className="text-sm text-muted">Brak kategorii — dodaj pierwszą powyżej.</p>
                : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {categories.map(cat => {
                    const count = products.filter(p => p.category === cat.name).length;
                    const isOpen = catFilter === cat.name;
                    const tree = buildSubcatTree(cat.subcategories);
                    return (
                      <div key={cat.name} className="category-block">
                        <div className="category-block-header" onClick={() => setCatFilter(isOpen ? "" : cat.name)}>
                          <span style={{ fontWeight: 600 }}>{isOpen ? "▾" : "▸"} {cat.name}</span>
                          <span className="text-sm text-muted">{count} produktów · {cat.subcategories.length} podkategorii</span>
                          <button onClick={e => { e.stopPropagation(); removeCategory(cat.name); }} className="cat-remove-btn" title="Usuń kategorię">✕</button>
                        </div>
                        {isOpen && (
                          <div className="category-block-body">
                            {Object.keys(tree).length === 0
                              ? <p className="text-sm text-muted" style={{ marginBottom: 10 }}>Brak podkategorii.</p>
                              : <div style={{ marginBottom: 12 }}>
                                {Object.values(tree).map(node => (
                                  <SubcatTreeNode
                                    key={node.fullPath}
                                    node={node}
                                    catName={cat.name}
                                    depth={0}
                                    products={products}
                                    newSub={newSub}
                                    setNewSub={setNewSub}
                                    addSubcategory={addSubcategory}
                                    removeSubcategory={removeSubcategory}
                                  />
                                ))}
                              </div>}
                            <div className="flex gap-2">
                              <input className="form-input" style={{ fontSize: ".82rem" }} placeholder={`Nowa podkategoria w "${cat.name}"`}
                                value={newSub[cat.name] || ""} onChange={e => setNewSub(prev => ({ ...prev, [cat.name]: e.target.value }))}
                                onKeyDown={e => e.key === "Enter" && addSubcategory(cat.name)} />
                              <button className="btn btn-secondary btn-sm" onClick={() => addSubcategory(cat.name)}>+ Dodaj</button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>}

              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary w-full" onClick={() => setModal(null)}>Zamknij</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "units" && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-header"><h2 className="modal-title">📏 Zarządzanie jednostkami miary</h2><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nowa jednostka</label>
                <div className="flex gap-2">
                  <input className="form-input" placeholder="Symbol (np. krt)" style={{ flex: 1 }} value={newUnitValue} onChange={e => setNewUnitValue(e.target.value)} onKeyDown={e => e.key === "Enter" && addUnit()} />
                  <input className="form-input" placeholder="Nazwa (np. karton)" style={{ flex: 1 }} value={newUnitLabel} onChange={e => setNewUnitLabel(e.target.value)} onKeyDown={e => e.key === "Enter" && addUnit()} />
                  <button className="btn btn-primary btn-sm" onClick={addUnit}>+ Dodaj</button>
                </div>
              </div>
              <div className="divider"></div>
              <p className="form-label mb-3">Istniejące jednostki:</p>
              <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                {units.map(u => {
                  const count = products.filter(p => p.unit === u.value).length;
                  return (
                    <span key={u.value} className="tag" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", fontSize: ".82rem" }}>
                      {u.label} <span className="text-muted">({u.value}) · {count}</span>
                      <button onClick={() => removeUnit(u.value)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontWeight: 700, fontSize: ".9rem", padding: "0 4px" }} title="Usuń jednostkę">✕</button>
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary w-full" onClick={() => setModal(null)}>Zamknij</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {delTarget && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header"><h2 className="modal-title">Usunąć produkt?</h2><button className="close-btn" onClick={() => setDelTarget(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ marginTop: 0 }}>Czy na pewno chcesz usunąć produkt <strong>{delTarget.name}</strong>? Tej operacji nie można cofnąć.</p>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={async () => {
                  try {
                    await api.deleteProduct(delTarget.id);
                    setProducts(prev => prev.filter(x => x.id !== delTarget.id));
                    showAlert("Produkt usunięty");
                  } catch (err) {
                    showAlert("Nie udało się usunąć z bazy danych: " + err.message, "danger");
                  } finally {
                    setDelTarget(null);
                  }
                }}>🗑️ Tak, usuń</button>
                <button className="btn btn-secondary" onClick={() => setDelTarget(null)}>Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bulkConfirm && (
        <div className="modal-bg">
          <div className="modal" style={{ maxWidth: 440 }}>
            <div className="modal-header"><h2 className="modal-title">Usunąć zaznaczone produkty?</h2><button className="close-btn" onClick={() => setBulkConfirm(false)}>✕</button></div>
            <div className="modal-body">
              <p style={{ marginTop: 0 }}>Czy na pewno chcesz usunąć <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? "produkt" : "produktów"}? Tej operacji nie można cofnąć.</p>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={async () => {
                  try {
                    await api.deleteProducts(selectedIds);
                    const removed = new Set(selectedIds);
                    setProducts(prev => prev.filter(x => !removed.has(x.id)));
                    showAlert(`Usunięto ${selectedIds.length} ${selectedIds.length === 1 ? "produkt" : "produktów"}`);
                    setSelectedIds([]);
                  } catch (err) {
                    showAlert("Nie udało się usunąć z bazy danych: " + err.message, "danger");
                  } finally {
                    setBulkConfirm(false);
                  }
                }}>🗑️ Tak, usuń zaznaczone</button>
                <button className="btn btn-secondary" onClick={() => setBulkConfirm(false)}>Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ADMIN KLIENCI ─────────────────────────────────────────────────────────────
function AdminUsers({ showAlert, modal, setModal, editItem, setEditItem, currentUser }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ role: "customer", discount: "0" });
  const [saving, setSaving] = useState(false);

  // Ładowanie listy klientów z bazy (tabela profiles) przy wejściu na panel.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.fetchProfiles();
        if (!cancelled) setProfiles(data || []);
      } catch (err) {
        if (!cancelled) showAlert("Nie udało się wczytać klientów: " + err.message, "danger");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openEdit = (u) => { setForm({ role: u.role || "customer", discount: String(u.discount ?? 0), paymentTerm: String(u.payment_term_days ?? 0) }); setEditItem(u); setModal("user"); };

  const save = async () => {
    if (!editItem) return;
    const newDiscount = Math.max(0, Math.min(100, +form.discount || 0));
    const newTerm = Math.max(0, +form.paymentTerm || 0);
    const isSelf = editItem.id === currentUser?.id;
    // Zabezpieczenie: nie pozwalamy odebrać roli admina samemu sobie
    // (inaczej można się zablokować poza panelem).
    const newRole = isSelf ? editItem.role : form.role;
    setSaving(true);
    try {
      await api.updateProfileDiscount(editItem.id, newDiscount);
      await api.updateProfilePaymentTerm(editItem.id, newTerm);
      if (!isSelf && form.role !== editItem.role) {
        await api.updateProfileRole(editItem.id, form.role);
      }
      setProfiles(prev => prev.map(p => p.id === editItem.id ? { ...p, discount: newDiscount, role: newRole, payment_term_days: newTerm } : p));
      showAlert("Dane klienta zaktualizowane");
      setModal(null);
    } catch (err) {
      showAlert("Nie udało się zapisać zmian: " + err.message, "danger");
    } finally {
      setSaving(false);
    }
  };

  const editingSelf = editItem && editItem.id === currentUser?.id;

  return (
    <>
      <div className="page-header"><h1 className="page-title">👥 Klienci</h1></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{profiles.length}</div><div className="stat-label">Wszystkich kont</div></div>
        <div className="stat-card"><div className="stat-value">{profiles.filter(u => u.role === "customer").length}</div><div className="stat-label">Klientów</div></div>
        <div className="stat-card"><div className="stat-value">{profiles.filter(u => (u.discount || 0) > 0).length}</div><div className="stat-label">Z rabatem</div></div>
      </div>
      <div className="card">
        {loading ? <div className="empty-state"><div className="icon">⏳</div>Wczytywanie klientów…</div>
          : profiles.length === 0 ? <div className="empty-state"><div className="icon">👥</div>Brak zarejestrowanych klientów. Konta pojawią się tu automatycznie po rejestracji w sklepie.</div>
          : <div className="table-wrap">
            <table>
              <thead><tr><th>Klient</th><th>Email</th><th>Rola</th><th>Rabat</th><th>Termin płatności</th><th>Akcje</th></tr></thead>
              <tbody>{profiles.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name || "—"}</strong>{u.id === currentUser?.id && <span className="badge badge-gray" style={{ marginLeft: 6 }}>To Ty</span>}</td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge ${u.role === "admin" ? "badge-orange" : "badge-blue"}`}>{u.role === "admin" ? "🔧 Admin" : "👤 Klient"}</span></td>
                  <td>{(u.discount || 0) > 0 ? <span className="badge badge-green">🎉 {u.discount}%</span> : <span className="badge badge-gray">Brak</span>}</td>
                  <td>{(u.payment_term_days || 0) > 0 ? <span className="badge badge-blue">{u.payment_term_days} dni</span> : <span className="badge badge-gray">Od razu</span>}</td>
                  <td><button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>✏️ Edytuj</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>}
      </div>
      {modal === "user" && editItem && (
        <div className="modal-bg">
          <div className="modal">
            <div className="modal-header"><h2 className="modal-title">Edytuj klienta</h2><button className="close-btn" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Klient</label><input className="form-input" value={`${editItem.name || "—"} (${editItem.email})`} disabled style={{ background: "#f8fafc" }} /></div>
              <div className="flex gap-3">
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Rola</label>
                  <select className="form-select" value={editingSelf ? editItem.role : form.role} disabled={editingSelf} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}><option value="customer">Klient</option><option value="admin">Admin</option></select>
                  {editingSelf && <div className="text-sm text-muted" style={{ marginTop: 4 }}>Nie możesz zmienić własnej roli.</div>}
                </div>
                <div className="form-group" style={{ flex: 1 }}><label className="form-label">Rabat (%)</label><input className="form-input" type="number" min="0" max="100" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Termin płatności</label>
                <select className="form-select" value={form.paymentTerm} onChange={e => setForm(f => ({ ...f, paymentTerm: e.target.value }))}>
                  <option value="0">Płatność od razu</option>
                  <option value="7">7 dni</option>
                  <option value="14">14 dni</option>
                  <option value="21">21 dni</option>
                  <option value="30">30 dni</option>
                  <option value="60">60 dni</option>
                </select>
                <div className="text-sm text-muted" style={{ marginTop: 4 }}>Termin przelewu dla tego klienta (B2B). Obowiązuje od następnego zalogowania klienta.</div>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={save} disabled={saving}>💾 {saving ? "Zapisywanie…" : "Zapisz"}</button>
                <button className="btn btn-secondary" onClick={() => setModal(null)}>Anuluj</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── ADMIN: ZAPYTANIA OFERTOWE ───────────────────────────────────────────────
const QUOTE_STATUSES = ["Nowe", "W trakcie", "Wycenione", "Zamknięte"];
function QuoteAdminPage({ showAlert }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const d = await api.fetchQuoteRequests(); if (!cancelled) setList(d || []); }
      catch (e) { if (!cancelled) showAlert("Nie udało się wczytać zapytań: " + e.message, "danger"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);
  const changeStatus = async (id, status) => {
    try { await api.updateQuoteStatus(id, status); setList(prev => prev.map(q => q.id === id ? { ...q, status } : q)); showAlert("Status zaktualizowany."); }
    catch (e) { showAlert("Nie udało się zmienić statusu: " + e.message, "danger"); }
  };
  return (
    <>
      <div className="page-header"><h1 className="page-title">📝 Zapytania ofertowe</h1></div>
      <div className="card">
        {loading ? <p className="text-muted">Wczytywanie…</p>
          : list.length === 0 ? <div className="empty-state"><div className="icon">📝</div>Brak zapytań ofertowych</div>
          : <div className="table-wrap"><table>
              <thead><tr><th>Data</th><th>Klient</th><th>Produkt</th><th>Ilość</th><th>Wiadomość</th><th>Status</th></tr></thead>
              <tbody>{list.map(q => (
                <tr key={q.id}>
                  <td className="text-sm text-muted">{new Date(q.created_at).toLocaleDateString("pl-PL")}</td>
                  <td><strong>{q.name}</strong><div className="text-sm text-muted">{q.email}{q.phone ? ` · ${q.phone}` : ""}{q.company ? ` · ${q.company}` : ""}</div></td>
                  <td>{q.product_name || "—"}</td>
                  <td>{q.quantity ?? "—"}</td>
                  <td style={{ maxWidth: 260, whiteSpace: "pre-wrap" }}>{q.message || "—"}</td>
                  <td><select className="form-select" style={{ padding: "5px 8px" }} value={q.status} onChange={e => changeStatus(q.id, e.target.value)}>{QUOTE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}</select></td>
                </tr>
              ))}</tbody>
            </table></div>}
      </div>
    </>
  );
}

// ── STATYSTYKI SPRZEDAŻY ────────────────────────────────────────────────────
function StatsPage({ currentUser, showAlert }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const data = await api.fetchOrders(currentUser.id, true); if (!cancelled) setOrders(data || []); }
      catch (e) { if (!cancelled) showAlert("Nie udało się wczytać danych: " + e.message, "danger"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <><div className="page-header"><h1 className="page-title">📈 Statystyki sprzedaży</h1></div><div className="empty-state"><div className="icon">⏳</div>Wczytywanie danych…</div></>;

  // Zrealizowane/aktywne liczymy jako sprzedaż; anulowane pomijamy.
  const valid = orders.filter(o => o.status !== "Anulowane");
  const revenue = valid.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const count = valid.length;
  const avg = count ? revenue / count : 0;
  const byStatus = {};
  orders.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  // Top produkty wg ilości i wartości (z pozycji zamówień).
  const prodMap = {};
  valid.forEach(o => (o.items || []).forEach(it => {
    const key = it.name || "—";
    if (!prodMap[key]) prodMap[key] = { name: key, qty: 0, value: 0 };
    prodMap[key].qty += Number(it.qty) || 0;
    prodMap[key].value += (Number(it.price) || 0) * (Number(it.qty) || 0);
  }));
  const topProducts = Object.values(prodMap).sort((a, b) => b.value - a.value).slice(0, 10);

  // Sprzedaż w ostatnich 30 dniach.
  const now = Date.now();
  const last30 = valid.filter(o => o.created_at && (now - new Date(o.created_at).getTime()) <= 30 * 86400000);
  const revenue30 = last30.reduce((s, o) => s + (Number(o.total) || 0), 0);

  return (
    <>
      <div className="page-header"><h1 className="page-title">📈 Statystyki sprzedaży</h1></div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value">{fmt(revenue)}</div><div className="stat-label">Przychód (brutto, bez anulowanych)</div></div>
        <div className="stat-card"><div className="stat-value">{count}</div><div className="stat-label">Liczba zamówień</div></div>
        <div className="stat-card"><div className="stat-value">{fmt(avg)}</div><div className="stat-label">Średnia wartość zamówienia</div></div>
        <div className="stat-card"><div className="stat-value">{fmt(revenue30)}</div><div className="stat-label">Przychód (30 dni)</div></div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Zamówienia wg statusu</h3>
        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          {Object.keys(byStatus).length === 0 ? <span className="text-muted">Brak zamówień</span>
            : Object.entries(byStatus).map(([s, n]) => (
              <span key={s} className={`badge ${s === "Zrealizowane" ? "badge-green" : s === "Anulowane" ? "badge-red" : s === "W realizacji" ? "badge-blue" : "badge-yellow"}`}>{s}: {n}</span>
            ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Najlepiej sprzedające się produkty</h3>
        {topProducts.length === 0 ? <div className="empty-state"><div className="icon">📦</div>Brak danych sprzedażowych</div>
          : <div className="table-wrap"><table>
              <thead><tr><th>Produkt</th><th>Sprzedana ilość</th><th>Wartość</th></tr></thead>
              <tbody>{topProducts.map((p, i) => (
                <tr key={i}><td><strong>{p.name}</strong></td><td>{p.qty}</td><td className="font-bold">{fmt(p.value)}</td></tr>
              ))}</tbody>
            </table></div>}
      </div>
    </>
  );
}

// ── ZAMÓWIENIA ────────────────────────────────────────────────────────────────
// ── GENEROWANIE PDF ZAMÓWIENIA ────────────────────────────────────────────────
// jsPDF domyślnie nie wspiera polskich znaków w standardowych fontach,
// dlatego zamieniamy je na najbliższe odpowiedniki łacińskie — dokument
// jest wtedy w 100% czytelny i nie wymaga dodatkowych plików fontów.
const PL_CHAR_MAP = {
  "ą": "a", "ć": "c", "ę": "e", "ł": "l", "ń": "n", "ó": "o", "ś": "s", "ź": "z", "ż": "z",
  "Ą": "A", "Ć": "C", "Ę": "E", "Ł": "L", "Ń": "N", "Ó": "O", "Ś": "S", "Ź": "Z", "Ż": "Z",
};
const pdfText = (str) => String(str ?? "").replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, ch => PL_CHAR_MAP[ch] || ch);

function generateOrderPDF(order, contactInfo, units) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 18;
  let y = 20;

  // Nagłówek firmy
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(pdfText(contactInfo?.companyName || "TARFIX"), marginX, y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  y += 6;
  if (contactInfo?.address) { doc.text(pdfText(contactInfo.address), marginX, y); y += 4.5; }
  if (contactInfo?.phone) { doc.text(pdfText(`Tel: ${contactInfo.phone}`), marginX, y); y += 4.5; }
  if (contactInfo?.email) { doc.text(pdfText(`E-mail: ${contactInfo.email}`), marginX, y); y += 4.5; }

  // Tytuł dokumentu + numer zamówienia
  y += 6;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(pdfText(`Zamowienie #${String(order.id).slice(-6)}`), marginX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(pdfText(order.date || ""), pageWidth - marginX, y, { align: "right" });
  y += 8;

  // Dane klienta
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(pdfText("Zamawiajacy:"), marginX, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(pdfText(order.user || "Klient"), marginX, y);
  if (order.guestEmail) { y += 5; doc.text(pdfText(order.guestEmail), marginX, y); }
  y += 9;

  // Dane do dostawy (jeśli podane przy zamówieniu)
  if (order.deliveryName || order.deliveryAddress || order.deliveryCompany) {
    doc.setFont("helvetica", "bold");
    doc.text(pdfText("Dostawa do:"), marginX, y);
    doc.setFont("helvetica", "normal");
    y += 5;
    if (order.deliveryCompany) { doc.text(pdfText(order.deliveryCompany), marginX, y); y += 5; }
    if (order.deliveryName) { doc.text(pdfText(order.deliveryName), marginX, y); y += 5; }
    if (order.deliveryAddress) { doc.text(pdfText(order.deliveryAddress), marginX, y); y += 5; }
    if (order.deliveryPhone) { doc.text(pdfText(`Tel: ${order.deliveryPhone}`), marginX, y); y += 5; }
    if (order.deliveryNip) { doc.text(pdfText(`NIP: ${order.deliveryNip}`), marginX, y); y += 5; }
    y += 4;
  }

  // Tabela pozycji zamówienia — nagłówek
  const colX = { name: marginX, price: marginX + 95, qty: marginX + 125, sum: pageWidth - marginX };
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(pdfText("Produkt"), colX.name, y);
  doc.text(pdfText("Cena"), colX.price, y);
  doc.text(pdfText("Ilosc"), colX.qty, y);
  doc.text(pdfText("Suma"), colX.sum, y, { align: "right" });
  y += 2;
  doc.setLineWidth(0.3);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 5;

  // Tabela pozycji zamówienia — wiersze
  doc.setFont("helvetica", "normal");
  order.items.forEach(item => {
    const unitLabel = units.find(u => u.value === item.unit)?.label || "szt.";
    const nameLines = doc.splitTextToSize(pdfText(item.name), 90);
    doc.text(nameLines, colX.name, y);
    doc.text(pdfText(`${fmt(item.price)}`), colX.price, y);
    doc.text(pdfText(`${item.qty} ${unitLabel}`), colX.qty, y);
    doc.text(pdfText(fmt(item.price * item.qty)), colX.sum, y, { align: "right" });
    y += Math.max(6, nameLines.length * 5);
  });

  y += 2;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 7;

  // Podsumowanie kosztów
  doc.setFontSize(9);
  doc.text(pdfText("Wartosc produktow:"), colX.price, y);
  doc.text(pdfText(fmt(order.subtotal)), colX.sum, y, { align: "right" });
  y += 5;
  if (order.discount > 0) {
    doc.text(pdfText(`Rabat (${order.discount}%):`), colX.price, y);
    doc.text(pdfText(`-${fmt(order.discountAmt)}`), colX.sum, y, { align: "right" });
    y += 5;
  }
  doc.text(pdfText(`Dostawa (${order.shipmentLabel || "—"}):`), colX.price, y);
  doc.text(pdfText(order.freeShipping ? "Gratis" : fmt(order.shippingCost || 0)), colX.sum, y, { align: "right" });
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(pdfText("Do zaplaty:"), colX.price, y);
  doc.text(pdfText(fmt(order.total)), colX.sum, y, { align: "right" });
  y += 10;

  // Płatność i status
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (order.paymentMethod) { doc.text(pdfText(`Metoda platnosci: ${order.paymentMethod}`), marginX, y); y += 5; }
  if (order.paymentStatus) { doc.text(pdfText(`Status platnosci: ${order.paymentStatus}`), marginX, y); y += 5; }
  doc.text(pdfText(`Status zamowienia: ${order.status}`), marginX, y);

  // Stopka
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(pdfText("Dokument wygenerowany automatycznie przez sklep internetowy."), marginX, 285);

  doc.save(`zamowienie_${String(order.id).slice(-6)}.pdf`);
}


const ORDER_STATUSES = ["Przyjęte", "W realizacji", "Zrealizowane", "Anulowane"];
const statusBadgeClass = (s) =>
  s === "Zrealizowane" ? "badge-green"
  : s === "Anulowane" ? "badge-red"
  : s === "W realizacji" ? "badge-blue"
  : "badge-yellow";

function OrdersPage({ orders, setOrders, isAdmin, units, contactInfo, showAlert }) {
  const [filter, setFilter] = useState("active"); // active | done | cancelled | all
  const [updatingId, setUpdatingId] = useState(null);

  const changeStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showAlert("Status zamówienia zaktualizowany");
    } catch (err) {
      showAlert("Nie udało się zmienić statusu: " + err.message, "danger");
    } finally {
      setUpdatingId(null);
    }
  };

  const isActive = (s) => s === "Przyjęte" || s === "W realizacji";
  const counts = {
    active: orders.filter(o => isActive(o.status)).length,
    done: orders.filter(o => o.status === "Zrealizowane").length,
    cancelled: orders.filter(o => o.status === "Anulowane").length,
    all: orders.length,
  };
  const visible = orders.filter(o => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(o.status);
    if (filter === "done") return o.status === "Zrealizowane";
    if (filter === "cancelled") return o.status === "Anulowane";
    return true;
  });

  const filters = [
    { key: "active", label: "Aktywne" },
    { key: "done", label: "Zrealizowane" },
    { key: "cancelled", label: "Anulowane" },
    { key: "all", label: "Wszystkie" },
  ];

  return (
    <>
      <div className="page-header"><h1 className="page-title">📋 {isAdmin ? "Wszystkie zamówienia" : "Moje zamówienia"}</h1></div>

      <div className="flex gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {filters.map(f => (
          <button key={f.key} className={`btn btn-sm ${filter === f.key ? "btn-primary" : "btn-secondary"}`} onClick={() => setFilter(f.key)}>
            {f.label} <span style={{ opacity: .7 }}>({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0
        ? <div className="empty-state"><div className="icon">📋</div>Brak zamówień w tym widoku</div>
        : visible.map(o => (
          <div key={o.id} className="card" style={{ marginBottom: 14 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 10, flexWrap: "wrap" }}>
              <span className="font-bold">#{o.id.toString().slice(-6)}</span>
              <span className="badge badge-blue">{o.date}</span>
              {isAdmin && <span className="badge badge-orange">👤 {o.user}{o.guestEmail ? ` (${o.guestEmail})` : ""}</span>}
              {o.paymentMethod && <span className="badge badge-blue">💳 {o.paymentMethod}</span>}
              {o.paymentStatus && <span className={`badge ${o.paymentStatus === "Opłacone" ? "badge-green" : "badge-yellow"}`}>{o.paymentStatus === "Opłacone" ? "✅" : "⏳"} {o.paymentStatus}</span>}
              {o.shipmentLabel && <span className="badge badge-gray">{o.shipmentType === "packages" ? "📦" : "🪵"} {o.shipmentLabel}</span>}
              <span className={`badge ${statusBadgeClass(o.status)}`}>{o.status}</span>
              <button className="btn btn-secondary btn-sm ml-auto" onClick={() => generateOrderPDF(o, contactInfo, units)}>📄 PDF</button>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <span className="text-sm text-muted">Status:</span>
                <select className="form-select" style={{ maxWidth: 200, padding: "5px 8px" }} value={o.status} disabled={updatingId === o.id}
                  onChange={e => changeStatus(o.id, e.target.value)}>
                  {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {updatingId === o.id && <span className="text-sm text-muted">zapisywanie…</span>}
              </div>
            )}

            <div className="table-wrap">
              <table>
                <thead><tr><th>Produkt</th><th>Cena</th><th>Ilość</th><th>Suma</th></tr></thead>
                <tbody>{o.items.map(i => <tr key={i.id}><td>{i.photo ? <img src={i.photo} alt={i.name} className="product-photo-thumb" /> : i.image} {i.name}</td><td>{fmt(i.price)}</td><td>{i.qty} {units.find(u => u.value === i.unit)?.label || "szt."}</td><td className="font-bold">{fmt(i.price * i.qty)}</td></tr>)}</tbody>
              </table>

            </div>
            {(o.deliveryName || o.deliveryAddress || o.deliveryCompany) && (
              <div style={{ marginTop: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: ".85rem", lineHeight: 1.6 }}>
                <strong>🚚 Dostawa:</strong>{" "}
                {o.deliveryCompany ? `${o.deliveryCompany}, ` : ""}{o.deliveryName}
                {o.deliveryAddress ? ` — ${o.deliveryAddress}` : ""}
                {o.deliveryPhone ? ` · tel. ${o.deliveryPhone}` : ""}
                {o.deliveryNip ? ` · NIP ${o.deliveryNip}` : ""}
              </div>
            )}
            <div style={{ marginTop: 10, textAlign: "right", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              {o.paymentTermDays > 0 && <span className="badge badge-blue" style={{ marginRight: 12 }}>💳 Termin płatności: {o.paymentTermDays} dni</span>}
              {o.discount > 0 && <span className="text-sm" style={{ color: "var(--success)", marginRight: 12 }}>Rabat {o.discount}%: −{fmt(o.discountAmt)}</span>}
              <span className="text-sm text-muted" style={{ marginRight: 12 }}>
                Dostawa: {o.freeShipping ? <span style={{ color: "var(--success)", fontWeight: 600 }}>Gratis</span> : fmt(o.shippingCost || 0)}
              </span>
              <span className="font-bold" style={{ color: "var(--primary)", fontSize: "1rem" }}>Do zapłaty: {fmt(o.total)}</span>
            </div>
          </div>
        ))}
    </>
  );
}
