// ════════════════════════════════════════════════════════════════════════
// EDGE FUNCTION: send-order-confirmation
// ════════════════════════════════════════════════════════════════════════
// Wysyła e-mail z potwierdzeniem zamówienia, używając serwisu Resend.
// Wywoływana z frontendu sklepu zaraz po złożeniu zamówienia.
//
// Jak wdrożyć (zrobimy to razem, gdy będziesz gotowy):
// 1. Zainstaluj Supabase CLI na komputerze (instrukcja w README głównym)
// 2. W terminalu, w folderze projektu: supabase functions deploy send-order-confirmation
// 3. Ustaw klucz Resend jako sekret: supabase secrets set RESEND_API_KEY=twoj_klucz
// ════════════════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zamienia kwotę (liczbę) na sformatowany string w PLN, np. 1234.5 -> "1 234,50 zł"
function fmtPLN(amount) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(amount || 0);
}

// Buduje treść HTML e-maila z potwierdzeniem zamówienia
function buildEmailHtml(order, contactInfo) {
  const itemRows = (order.items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;">${fmtPLN(item.price)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${fmtPLN(item.price * item.qty)}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1c1c1c;">
    <div style="background:#111722;padding:20px;text-align:center;border-radius:10px 10px 0 0;">
      <h1 style="color:#1cb88a;margin:0;font-size:22px;">${contactInfo?.companyName || "TARFIX"}</h1>
    </div>
    <div style="padding:24px;border:1px solid #e5e7eb;border-radius:0 0 10px 10px;">
      <h2 style="font-size:18px;margin-top:0;">Dziękujemy za zamówienie!</h2>
      <p style="color:#555;line-height:1.5;">
        Twoje zamówienie <strong>#${String(order.id).slice(-6)}</strong> zostało przyjęte do realizacji.
        Poniżej znajdziesz podsumowanie.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px 10px;text-align:left;">Produkt</th>
            <th style="padding:8px 10px;text-align:center;">Ilość</th>
            <th style="padding:8px 10px;text-align:right;">Cena</th>
            <th style="padding:8px 10px;text-align:right;">Suma</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="text-align:right;font-size:14px;line-height:1.8;">
        ${order.discount > 0 ? `<div>Rabat (${order.discount}%): <strong>-${fmtPLN(order.discountAmt)}</strong></div>` : ""}
        <div>Dostawa: <strong>${order.freeShipping ? "Gratis" : fmtPLN(order.shippingCost)}</strong></div>
        <div style="font-size:18px;margin-top:6px;color:#1cb88a;">Do zapłaty: <strong>${fmtPLN(order.total)}</strong></div>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />

      <p style="color:#888;font-size:12px;line-height:1.5;">
        ${contactInfo?.companyName || "TARFIX"} · ${contactInfo?.address || ""}<br/>
        ${contactInfo?.phone ? `Tel: ${contactInfo.phone} · ` : ""}${contactInfo?.email ? `E-mail: ${contactInfo.email}` : ""}
      </p>
    </div>
  </div>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order, contactInfo, recipientEmail } = await req.json();

    if (!recipientEmail) {
      return new Response(JSON.stringify({ error: "Brak adresu e-mail odbiorcy" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY nie jest skonfigurowany" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = buildEmailHtml(order, contactInfo);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Domyślny adres testowy Resend — działa od razu, bez własnej domeny.
        // Po weryfikacji własnej domeny w Resend, zmień na np. "zamowienia@tarfix.pl".
        from: "TARFIX <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: `Potwierdzenie zamówienia #${String(order.id).slice(-6)} — ${contactInfo?.companyName || "TARFIX"}`,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ error: resendData }), {
        status: resendResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
