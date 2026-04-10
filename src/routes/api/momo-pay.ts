/**
 * /src/api/momo-pay.ts
 * Route POST /api/momo-pay
 */
import { json } from "@solidjs/router";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

async function pbAdminAuth() {
  if (!pb.authStore.isValid) {
    await pb.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL!,
      process.env.PB_ADMIN_PASSWORD!,
    );
  }
}

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";

async function sendEmail(to: string, subject: string, html: string, name = "") {
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: STORE_NAME, email: STORE_EMAIL },
        to: [{ email: to, name: name || to }],
        subject,
        htmlContent: html,
      }),
    });
  } catch (err) {
    console.error("[brevo]", err);
  }
}

// ── HANDLER PRINCIPAL ──────────────────────────────────────────────

export async function POST({ request }: { request: Request }) {
  let body: any;
  try { body = await request.json(); } 
  catch { return json({ error: "Corps invalide" }, { status: 400 }); }

  const { orderId, momoPhone } = body;
  if (!orderId || !momoPhone) return json({ error: "Champs manquants" }, { status: 400 });

  let order: any;
  try {
    order = await pb.collection("orders").getOne(orderId);
  } catch {
    return json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (!["pending", "pending_momo"].includes(order.status)) {
    return json({ error: "Commande déjà traitée" }, { status: 409 });
  }

  const msisdn = momoPhone.replace(/[\s+\-()]/g, "");
  let finalReferenceId = ""; 

  try {
    console.log(`[momo-pay] Demande de paiement pour ${orderId}`);
    
    const bridgeRes = await fetch("http://localhost:4000/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(Math.round(order.total / 100)),
        phone: msisdn,
        externalId: orderId
      })
    });

    const bridgeData = await bridgeRes.json();
    if (!bridgeRes.ok || !bridgeData.success) throw new Error(bridgeData.error || "Erreur Bridge");

    finalReferenceId = bridgeData.referenceId;

    // ENVOI DE L'EMAIL AVEC LE TEMPLATE HARMONISÉ
    const email = order.customer_email || order.customerEmail;
    const name  = order.customer_name || order.customerName || "Client";

    if (email) {
      await sendEmail(
        email,
        `TRÄNCËNÐ — Demande de paiement MoMo #${orderId.slice(-8).toUpperCase()}`,
        buildMomoPayEmail({
          name,
          orderId,
          total: order.total / 100,
          deliveryMode: order.retrait_mode || order.delivery_mode || "shipping",
          relayCity: order.relay_city || order.retrait_point || "",
          items: order.items || [],
        }),
        name
      );
    }
    
  } catch (err: any) {
    console.error("[momo-pay] Erreur:", err.message);

    if (process.env.MOMO_DEV_BYPASS === "true") {
      finalReferenceId = `bypass-${crypto.randomUUID()}`;
      await pbAdminAuth();
      await pb.collection("orders").update(orderId, { momo_reference_id: finalReferenceId, status: "pending_momo" });
      return json({ success: true, referenceId: finalReferenceId, bypassed: true });
    }
    return json({ error: err.message || "Erreur MoMo" }, { status: 502 });
  }

  await pbAdminAuth();
  await pb.collection("orders").update(orderId, {
    momo_reference_id: finalReferenceId,
    status: "pending_momo",
  });

  return json({ success: true, referenceId: finalReferenceId });
}

// ── TEMPLATE EMAIL (Version "En attente") ──────────────────────────

function buildMomoPayEmail(opts: {
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
          📍 <strong>Mode : Point relais</strong><br>Ville de retrait : <strong>${opts.relayCity}</strong>
        </p>
       </div>`
    : `<div style="background:#f0ede8;padding:14px 16px;margin-bottom:24px;border-left:3px solid #111">
        <p style="margin:0;font-size:12px;color:#666;line-height:1.6">
          🚚 <strong>Mode : Livraison à domicile</strong>
        </p>
       </div>`;

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
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">Demande de paiement envoyée</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6">Bonjour ${opts.name},<br>Veuillez confirmer la transaction sur votre téléphone pour finaliser votre commande.</p>
          
          <div style="background:#f0ede8;padding:12px 16px;margin-bottom:24px;border-left:3px solid #111">
            <p style="margin:0;font-family:monospace;font-size:9px;color:#888">RÉFÉRENCE COMMANDE</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#111;font-weight:700">#${opts.orderId.slice(-8).toUpperCase()}</p>
          </div>

          ${relayNote}

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="padding:15px 0;border-top:2px solid #111">
             <p style="margin:0;text-align:right;font-size:16px;font-weight:bold">Total à régler : ${opts.total.toLocaleString("fr-FR")} €</p>
          </div>

          <p style="font-size:11px;color:#999;margin-top:30px">Si vous n'avez pas reçu de notification, assurez-vous que votre compte MoMo est actif et dispose du solde nécessaire.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}