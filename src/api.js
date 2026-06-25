import { supabase } from "./supabaseClient";

// ════════════════════════════════════════════════════════════════════════
// AUTORYZACJA (logowanie, rejestracja, gość)
// ════════════════════════════════════════════════════════════════════════

export async function signUp(name, email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }, // trafia do trigger'a, który tworzy profil
  });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Pobiera dane profilu (rola, rabat) dla zalogowanego użytkownika
export async function getProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

// Zmiana hasła zalogowanego użytkownika (Supabase Auth).
// Wymaga aktywnej sesji — użytkownik musi być zalogowany.
export async function changePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

// Zwraca aktualnie zalogowanego użytkownika Auth (lub null, jeśli brak sesji).
// Używane przy starcie aplikacji do przywrócenia sesji po odświeżeniu strony.
export async function getSessionUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session?.user || null;
}

// Subskrypcja zmian stanu logowania (login / logout / odświeżenie tokenu).
// Zwraca funkcję do odsubskrybowania.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });
  return () => data?.subscription?.unsubscribe();
}

// Buduje obiekt użytkownika w formacie używanym przez aplikację
// ({ id, name, email, role, discount }) na podstawie użytkownika Auth + profilu.
export async function buildAppUser(authUser) {
  if (!authUser) return null;
  let profile = null;
  try {
    profile = await getProfile(authUser.id);
  } catch (err) {
    // Profil może jeszcze nie istnieć (trigger tworzy go przy rejestracji).
    console.warn("Nie udało się pobrać profilu użytkownika:", err.message);
  }
  return {
    id: authUser.id,
    email: authUser.email,
    name: profile?.name || authUser.user_metadata?.name || authUser.email,
    role: profile?.role || "customer",
    discount: profile?.discount || 0,
  };
}

// ════════════════════════════════════════════════════════════════════════
// KATEGORIE
// ════════════════════════════════════════════════════════════════════════

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("id");
  if (error) throw error;
  return data; // [{ id, name, subcategories: [...] }, ...]
}

export async function addCategory(name) {
  const { data, error } = await supabase.from("categories").insert({ name, subcategories: [] }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function addSubcategory(categoryId, currentSubcats, newSub) {
  const updated = [...currentSubcats, newSub];
  const { error } = await supabase.from("categories").update({ subcategories: updated }).eq("id", categoryId);
  if (error) throw error;
  return updated;
}

export async function removeSubcategory(categoryId, currentSubcats, subToRemove) {
  const updated = currentSubcats.filter((s) => s !== subToRemove);
  const { error } = await supabase.from("categories").update({ subcategories: updated }).eq("id", categoryId);
  if (error) throw error;
  return updated;
}

// ════════════════════════════════════════════════════════════════════════
// PRODUKTY
// ════════════════════════════════════════════════════════════════════════

export async function fetchProducts() {
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw error;
  return data;
}

// OMNIBUS: pobiera najniższe ceny z 30 dni dla wszystkich produktów naraz.
// Zwraca mapę { [productId]: najniższaCena30dni | null }.
export async function fetchOmnibusFloors() {
  const { data, error } = await supabase.from("product_omnibus").select("*");
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => {
    map[r.product_id] = r.lowest_30d != null ? Number(r.lowest_30d) : null;
  });
  return map;
}

export async function addProduct(product) {
  const { data, error } = await supabase.from("products").insert(product).select().single();
  if (error) throw error;
  return data;
}

export async function updateProduct(id, product) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...product, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// Masowy import/aktualizacja z CSV (WF-Mag) — wstawia nowe, aktualizuje istniejące po SKU
export async function upsertProductsBySku(products) {
  const { data, error } = await supabase.from("products").upsert(products, { onConflict: "sku" }).select();
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════
// KLIENCI (profile)
// ════════════════════════════════════════════════════════════════════════

export async function fetchProfiles() {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function updateProfileDiscount(id, discount) {
  const { error } = await supabase.from("profiles").update({ discount }).eq("id", id);
  if (error) throw error;
}

export async function updateProfileRole(id, role) {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// ZAMÓWIENIA
// ════════════════════════════════════════════════════════════════════════

export async function createOrder(order) {
  const { data, error } = await supabase.from("orders").insert(order).select().single();
  if (error) throw error;
  return data;
}

export async function fetchOrders(userId, isAdmin) {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ════════════════════════════════════════════════════════════════════════
// USTAWIENIA SKLEPU (np. dane kontaktowe) — przechowywane jako pary klucz/wartość
// ════════════════════════════════════════════════════════════════════════

export async function fetchContactInfo() {
  const { data, error } = await supabase.from("settings").select("value").eq("key", "contact_info").single();
  if (error) throw error;
  return data?.value || null;
}

export async function saveContactInfo(contactInfo) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "contact_info", value: contactInfo }, { onConflict: "key" });
  if (error) throw error;
}

export async function fetchBannerInfo() {
  const { data, error } = await supabase.from("settings").select("value").eq("key", "shop_banner").single();
  if (error) throw error;
  return data?.value || null;
}

export async function saveBannerInfo(bannerInfo) {
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "shop_banner", value: bannerInfo }, { onConflict: "key" });
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// POTWIERDZENIE ZAMÓWIENIA E-MAILEM (Edge Function + Resend)
// ════════════════════════════════════════════════════════════════════════
// Wywołuje funkcję serwerową w Supabase, która wysyła e-mail przez Resend.
// Jeśli funkcja nie jest jeszcze wdrożona (lub brak klucza Resend), zgłasza
// błąd — App.jsx łapie go tak, by nie przerywać składania zamówienia.
export async function sendOrderConfirmationEmail(order, contactInfo, recipientEmail) {
  const { data, error } = await supabase.functions.invoke("SEND-ORDER-CONFIRMATION", {
    body: { order, contactInfo, recipientEmail },
  });
  if (error) throw error;
  return data;
}


