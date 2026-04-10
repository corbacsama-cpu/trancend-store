/**
 * /src/api/momo-status.ts
 * Route GET /api/momo-status?referenceId=xxx&orderId=xxx
 * Vérifie le statut via le Bridge et finalise la commande (Email + PocketBase)
 */
import { json } from "@solidjs/router";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

/** Authentifie le client PB en superuser */
async function pbAdminAuth() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    );
  }
}

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL   = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME    = "TRÄNCËNÐ";

/** Envoie l'email de confirmation via Brevo */
async function sendEmail(to: string, subject: string, html: string, name = "") {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: STORE_NAME, email: STORE_EMAIL },
        to: [{ email: to, name: name || to }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[brevo] Error", res.status, text);
    } else {
      console.log("[brevo] Email sent to:", to);
    }
  } catch (err) { 
    console.error("[brevo] Exception:", err); 
  }
}

// ── HANDLER GET ──────────────────────────────────────────────────

export async function GET({ request }: { request: Request }) {
  const url         = new URL(request.url);
  const referenceId = url.searchParams.get("referenceId");
  const orderId     = url.searchParams.get("orderId");

  if (!referenceId || !orderId) {
    return json({ error: "Paramètres manquants" }, { status: 400 });
  }

  let result: any;
  try {
    // 1. Vérification du statut (Bypass ou Bridge)
    if (process.env.MOMO_DEV_BYPASS === "true" && referenceId.startsWith("bypass-")) {
      result = { status: "SUCCESSFUL" };
    } else {
      // APPEL DU BRIDGE LOCAL (Port 4000)
      const res = await fetch(`http://localhost:4000/status/${referenceId}`);
      result = await res.json();
    }
  } catch (err: any) {
    console.error("[momo-status] Erreur Bridge:", err.message);
    return json({ error: "Impossible de joindre le service de paiement" }, { status: 502 });
  }

  // 2. Si paiement réussi → Finalisation
  if (result.status === "SUCCESSFUL") {
    let order: any;
    try {
      await pbAdminAuth();
      order = await pb.collection("orders").getOne(orderId);
      
      if (order.status !== "confirmed") {
        await pb.collection("orders").update(orderId, { status: "confirmed" });
  
        const email = order.customer_email || order.customerEmail; 
        const name  = order.customer_name || order.customerName || "Client";
  
        if (email) {
          // Log de debug pour vérifier ce que contient 'order' si ça manque encore
          console.log("[DEBUG] Data for email:", {
            mode: order.retrait_mode,
            city: order.relay_city,
            point: order.retrait_point
          });
  
          await sendEmail(
            email,
            `TRÄNCËNÐ — Paiement confirmé #${orderId.slice(-8).toUpperCase()}`,
            buildMomoConfirmEmail({
              name,
              orderId,
              total: order.total / 100,
              // Correction ici : on vérifie toutes les variantes possibles
              deliveryMode: order.retrait_mode || order.delivery_mode || "shipping",
              relayCity: order.relay_city || order.retrait_point || order.city || "",
              items: order.items || [],
            }),
            name
          );
        }
      }
    } catch (err) {
      console.error("[momo-status] Erreur finalisation:", err);
    }
  }

  // 3. Si paiement échoué
  if (result.status === "FAILED") {
    await pbAdminAuth();
    await pb.collection("orders").update(orderId, { status: "failed" }).catch(() => {});
  }

  return json({ status: result.status, reason: result.reason });
}

// ── TEMPLATE EMAIL ───────────────────────────────────────────────

function buildMomoConfirmEmail(opts: {
  name: string;
  orderId: string;
  total: number;
  relayCity?: string;
  deliveryMode?: string;
  items?: any[];
}) {
  const itemsHtml = (opts.items || []).map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;font-family:sans-serif;font-size:13px;color:#333">
        ${i.name}${i.size && i.size !== "UNIQUE" ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;text-align:right;font-family:sans-serif;font-size:13px;color:#333">
        x${i.quantity} · ${(i.price * i.quantity).toLocaleString("fr-FR")} €
      </td>
    </tr>`).join("");

  const relayNote = opts.deliveryMode === "relay" && opts.relayCity
    ? `<div style="background:#fff9e6;border:1px solid #f0d080;border-left:3px solid #f0b429;padding:14px 16px;margin-bottom:24px">
        <p style="margin:0;font-size:12px;color:#8a6000;line-height:1.6">
          📍 <strong>Point relais :</strong> Nous vous contacterons pour confirmer le point de retrait à <strong>${opts.relayCity}</strong>.
        </p>
       </div>`
    : "";

  return `
<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">
        <tr>
          <td style="background:#111110;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ</p>
          </td>
        </tr>
        <tr><td style="padding:36px">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">Paiement MoMo confirmé ✓</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6">Bonjour ${opts.name}, votre paiement a été validé.</p>
          <div style="background:#f0ede8;padding:12px 16px;margin-bottom:24px;border-left:3px solid #111">
            <p style="margin:0;font-family:monospace;font-size:9px;color:#888">RÉFÉRENCE</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#111;font-weight:700">#${opts.orderId.slice(-8).toUpperCase()}</p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="font-weight:bold">Total : ${opts.total.toLocaleString("fr-FR")} €</p>
          ${relayNote}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}