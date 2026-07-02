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

// Zapis danych firmy zalogowanego użytkownika — przez bezpieczną funkcję RPC,
// która aktualizuje wyłącznie pola firmowe dla auth.uid() (bez roli/rabatu).
export async function updateMyCompany(fields) {
  const { error } = await supabase.rpc("update_my_company", {
    p_company_name: fields.companyName || null,
    p_nip: fields.nip || null,
    p_company_address: fields.companyAddress || null,
    p_phone: fields.phone || null,
    p_contact_name: fields.contactName || null,
  });
  if (error) throw error;
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

// Subskrypcja zmian stanu logowania (login / logout / odświeżenie tokenu /
// odzyskiwanie hasła). Przekazuje użytkownika oraz typ zdarzenia.
export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, event);
  });
  return () => data?.subscription?.unsubscribe();
}

// Wysyła e-mail z linkiem do zresetowania hasła (wbudowana usługa Supabase Auth).
// redirectTo musi być dozwolonym adresem w ustawieniach Auth (Redirect URLs).
export async function sendPasswordReset(email) {
  const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
  if (error) throw error;
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
    paymentTermDays: profile?.payment_term_days || 0,
    companyName: profile?.company_name || "",
    nip: profile?.nip || "",
    companyAddress: profile?.company_address || "",
    phone: profile?.phone || "",
    contactName: profile?.contact_name || "",
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

// Lekka aktualizacja stanu magazynowego (po złożeniu zamówienia).
// Aktualizuje tylko przekazane pola (stock i/lub variants) — bez odczytu zwrotnego.
export async function updateProductStock(id, fields) {
  const { error } = await supabase
    .from("products")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
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

// Hurtowe usunięcie wielu produktów po liście ID.
export async function deleteProducts(ids) {
  if (!ids || ids.length === 0) return;
  const { error } = await supabase.from("products").delete().in("id", ids);
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// DOKUMENTY TECHNICZNE (pliki w Supabase Storage, bucket "product-docs")
// ════════════════════════════════════════════════════════════════════════
export async function uploadProductDoc(file) {
  const safeName = (file.name || "plik").replace(/[^\w.\-]+/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage.from("product-docs").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("product-docs").getPublicUrl(path);
  return { name: file.name || safeName, url: data.publicUrl, path };
}
export async function deleteProductDoc(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("product-docs").remove([path]);
  if (error) throw error;
}

// ZDJĘCIA PRODUKTÓW / WARIANTÓW (bucket "product-images", publiczny odczyt)
export async function uploadProductImage(file) {
  const safeName = (file.name || "img").replace(/[^\w.\-]+/g, "_");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl, path };
}
export async function deleteProductImage(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("product-images").remove([path]);
  if (error) throw error;
}

// Szybkie przełączenie widoczności produktu w sklepie (szkic / opublikowany).
export async function setProductPublished(id, published) {
  const { error } = await supabase.from("products").update({ published }).eq("id", id);
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

export async function updateProfilePaymentTerm(id, days) {
  const { error } = await supabase.from("profiles").update({ payment_term_days: days }).eq("id", id);
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// ZAMÓWIENIA
// ════════════════════════════════════════════════════════════════════════

export async function createOrder(order) {
  // Zapis bez odczytu zwrotnego (.select()). Dzięki temu po zaostrzeniu RLS
  // gość (brak konta) wciąż może złożyć zamówienie — insert nie wymaga wtedy
  // polityki SELECT. Aplikacja i tak nie używa zwracanego wiersza (lokalne
  // zamówienie ma własne id, a mail korzysta z przekazanych danych).
  const { error } = await supabase.from("orders").insert(order);
  if (error) throw error;
}

export async function fetchOrders(userId, isAdmin) {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (!isAdmin) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Zmiana statusu zamówienia (tylko admin — pilnuje tego polityka RLS "Admin
// zarządza zamówieniami" na UPDATE). status: Przyjęte / W realizacji /
// Zrealizowane / Anulowane.
export async function updateOrderStatus(orderId, status) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) throw error;
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

// Generyczny odczyt/zapis treści w settings (np. regulamin, polityka cookies).
// Odczyt publiczny; zapis tylko admin (pilnuje tego polityka RLS na settings).
export async function fetchSetting(key) {
  const { data, error } = await supabase.from("settings").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data?.value ?? null;
}
export async function saveSetting(key, value) {
  const { error } = await supabase.from("settings").upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// REKLAMACJE
// ════════════════════════════════════════════════════════════════════════
export async function createComplaint(complaint) {
  const { error } = await supabase.from("complaints").insert(complaint);
  if (error) throw error;
}
export async function fetchComplaints() {
  const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function updateComplaintStatus(id, status) {
  const { error } = await supabase.from("complaints").update({ status }).eq("id", id);
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// OPINIE I OCENY PRODUKTÓW
// ════════════════════════════════════════════════════════════════════════
export async function createReview(review) {
  const { error } = await supabase.from("reviews").insert(review);
  if (error) throw error;
}
export async function fetchReviews(productId) {
  const { data, error } = await supabase.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}
// Mapa ocen { [productId]: { avg, count } } — do gwiazdek na kartach.
export async function fetchProductRatings() {
  const { data, error } = await supabase.from("product_ratings").select("*");
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => { map[r.product_id] = { avg: Number(r.avg_rating) || 0, count: Number(r.review_count) || 0 }; });
  return map;
}

// ════════════════════════════════════════════════════════════════════════
// ZAPYTANIA OFERTOWE
// ════════════════════════════════════════════════════════════════════════
export async function createQuoteRequest(q) {
  const { error } = await supabase.from("quote_requests").insert(q);
  if (error) throw error;
}
export async function fetchQuoteRequests() {
  const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
export async function updateQuoteStatus(id, status) {
  const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

// ════════════════════════════════════════════════════════════════════════
// POTWIERDZENIE ZAMÓWIENIA E-MAILEM (Edge Function + Resend)
// ════════════════════════════════════════════════════════════════════════
// Wywołuje funkcję serwerową w Supabase, która wysyła e-mail przez Resend.
// Jeśli funkcja nie jest jeszcze wdrożona (lub brak klucza Resend), zgłasza
// błąd — App.jsx łapie go tak, by nie przerywać składania zamówienia.
export async function sendOrderConfirmationEmail(order, contactInfo, recipientEmail) {
  // Do funkcji maila wysyłamy TYLKO dane, których używa szablon wiadomości
  // (nazwa, ilość, cena pozycji + podsumowanie). Pomijamy ciężkie pola jak
  // zdjęcia produktów (base64), długie opisy i specyfikacje — bez tego
  // żądanie jest małe (kilka KB zamiast ~126 KB) i nie jest odrzucane.
  const slimOrder = {
    id: order.id,
    items: (order.items || []).map(it => ({ name: it.name, qty: it.qty, price: it.price })),
    discount: order.discount,
    discountAmt: order.discountAmt,
    shippingCost: order.shippingCost,
    freeShipping: order.freeShipping,
    total: order.total,
  };
  const slimContact = contactInfo ? {
    companyName: contactInfo.companyName,
    address: contactInfo.address,
    phone: contactInfo.phone,
    email: contactInfo.email,
  } : null;

  const { data, error } = await supabase.functions.invoke("SEND-ORDER-CONFIRMATION", {
    body: { order: slimOrder, contactInfo: slimContact, recipientEmail },
  });
  if (error) throw error;
  return data;
}


