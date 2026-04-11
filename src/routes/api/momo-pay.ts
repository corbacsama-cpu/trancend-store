/**
 * /src/api/momo-pay.ts
 * Route POST /api/momo-pay
 * Reçoit validatedOrder + momoPhone, lance le paiement MTN.
 * NE crée PAS de commande PocketBase — c'est momo-status.ts qui le fait après SUCCESSFUL.
 */
import { json } from "@solidjs/router";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";

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
    if (!res.ok) console.error("[brevo] Error:", res.status, await res.text());
    else console.log("[brevo] Email sent to:", to);
  } catch (err) { console.error("[brevo]", err); }
}

export async function POST({ request }: { request: Request }) {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: "Corps invalide" }, { status: 400 }); }

  const { validatedOrder, momoPhone } = body;
  if (!validatedOrder || !momoPhone) {
    return json({ error: "validatedOrder et momoPhone requis" }, { status: 400 });
  }

  const msisdn = momoPhone.replace(/[\s+\-()]/g, "");
  const tempId = crypto.randomUUID();
  let referenceId = "";

  try {
    console.log(`[momo-pay] Lancement paiement — ${validatedOrder.total} € → ${msisdn}`);

    const bridgeRes = await fetch("http://localhost:4000/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: String(Math.round(validatedOrder.total)),
        phone: msisdn,
        externalId: tempId,
      }),
    });

    const bridgeData = await bridgeRes.json();
    if (!bridgeRes.ok || !bridgeData.success) throw new Error(bridgeData.error || "Erreur Bridge");

    referenceId = bridgeData.referenceId;
    console.log("[momo-pay] referenceId:", referenceId);

    // Email "demande envoyée" au client (avant confirmation paiement)
    if (validatedOrder.customerEmail) {
      await sendEmail(
        validatedOrder.customerEmail,
        `TRÄNCËNÐ — Demande de paiement MoMo`,
        buildMomoPayEmail({
          name: validatedOrder.customerName || validatedOrder.customerEmail,
          total: validatedOrder.total,
          deliveryMode: validatedOrder.deliveryMode,
          relayCity: validatedOrder.relayCity || "",
          items: validatedOrder.items || [],
        }),
        validatedOrder.customerName,
      );
    }

  } catch (err: any) {
    console.error("[momo-pay] Erreur:", err.message);

    // Dev bypass — simule le referenceId sans appel réel
    if (process.env.MOMO_DEV_BYPASS === "true") {
      referenceId = `bypass-${crypto.randomUUID()}`;
      console.warn("[momo-pay] DEV BYPASS — referenceId simulé:", referenceId);
      return json({ success: true, referenceId, bypassed: true });
    }

    return json({ error: err.message || "Erreur MoMo" }, { status: 502 });
  }

  return json({ success: true, referenceId });
}

// ── Template email "demande envoyée" ────────────────────────────

function buildMomoPayEmail(opts: {
  name: string;
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

  const deliveryNote = opts.deliveryMode === "relay" && opts.relayCity
    ? `<div style="background:#fff9e6;border-left:3px solid #f0b429;padding:12px 16px;margin-bottom:20px">
        <p style="margin:0;font-size:12px;color:#8a6000">📍 Point relais — ville : <strong>${opts.relayCity}</strong></p>
       </div>`
    : `<div style="background:#f0ede8;border-left:3px solid #111;padding:12px 16px;margin-bottom:20px">
        <p style="margin:0;font-size:12px;color:#555">🚚 Livraison à domicile</p>
       </div>`;

  return `
<!DOCTYPE html><html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">
        <tr><td style="background:#111110;padding:24px 32px">
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ</p>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">Demande de paiement envoyée</h1>
          <p style="margin:0 0 20px;font-size:13px;color:#666;line-height:1.6">
            Bonjour ${opts.name},<br>
            Veuillez confirmer la transaction sur votre téléphone MTN pour finaliser votre commande.
          </p>
          ${deliveryNote}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-top:2px solid #111">
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="padding:12px 0;border-top:1px solid #ccc;text-align:right">
            <p style="margin:0;font-size:15px;font-weight:700;color:#111">Total : ${opts.total.toLocaleString("fr-FR")} €</p>
          </div>
          <p style="font-size:11px;color:#999;margin-top:24px;line-height:1.7">
            Si vous ne recevez pas de notification, vérifiez votre solde MoMo.<br>
            Contact : <a href="mailto:${STORE_EMAIL}" style="color:#111">${STORE_EMAIL}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f0ede8;padding:16px 32px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">© ${new Date().getFullYear()} TRÄNCËNÐ</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
