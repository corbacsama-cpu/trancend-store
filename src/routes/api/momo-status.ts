/**
 * /src/api/momo-status.ts
 * Route GET /api/momo-status?referenceId=xxx&orderId=xxx
 * Polling du statut — appelé par la page order-confirm
 */
import { json } from "@solidjs/router";
import PocketBase from "pocketbase";
import { getMomoPaymentStatus } from "~/lib/momo";

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
const STORE_EMAIL   = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME    = "TRÄNCËNÐ";

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
  } catch (err) { console.error("[brevo]", err); }
}

export async function GET({ request }: { request: Request }) {
  const url         = new URL(request.url);
  const referenceId = url.searchParams.get("referenceId");
  const orderId     = url.searchParams.get("orderId");

  if (!referenceId || !orderId) {
    return json({ error: "Paramètres manquants" }, { status: 400 });
  }

  let result: any;
  try {
    // En dev bypass : simuler SUCCESSFUL directement
    if (process.env.MOMO_DEV_BYPASS === "true") {
      console.warn("[momo-status] DEV BYPASS — simulation statut SUCCESSFUL");
      result = { status: "SUCCESSFUL" };
    } else {
      result = await getMomoPaymentStatus(referenceId);
    }
  } catch (err: any) {
    return json({ error: err.message }, { status: 502 });
  }

  // Si paiement réussi → finaliser la commande
  if (result.status === "SUCCESSFUL") {
    let order: any;
    try {
      order = await pb.collection("orders").getOne(orderId);
    } catch {
      return json({ status: "SUCCESSFUL", error: "Commande introuvable" });
    }

    // Anti-doublon
    if (order.status !== "confirmed") {
      await pbAdminAuth();
      await pb.collection("orders").update(orderId, { status: "confirmed" });

      // Email confirmation client
      const email = order.customer_email;
      const name  = order.customer_name || email;
      if (email) {
        await sendEmail(
          email,
          `TRÄNCËNÐ — Paiement confirmé #${orderId.slice(-8).toUpperCase()}`,
          buildMomoConfirmEmail({ name, orderId, total: order.total / 100 }),
          name,
        );
      }

      // Email interne
      await sendEmail(
        STORE_EMAIL,
        `MoMo payé — ${name} · ${order.total / 100} €`,
        `<p>Paiement MoMo confirmé pour la commande <strong>${orderId}</strong>.</p>
         <p>Client : ${name} (${email})</p>
         <p>Montant : ${order.total / 100} €</p>`,
        STORE_NAME,
      );
    }
  }

  // Si paiement échoué → mettre à jour le statut
  if (result.status === "FAILED") {
    await pbAdminAuth();
    await pb.collection("orders").update(orderId, { status: "failed" }).catch(() => {});
  }

  return json({ status: result.status, reason: result.reason });
}

function buildMomoConfirmEmail(opts: { name: string; orderId: string; total: number }) {
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
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">
            Paiement MoMo confirmé ✓
          </h1>
          <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6">
            Bonjour ${opts.name},<br>
            Votre paiement Mobile Money a été validé avec succès.
          </p>
          <div style="background:#f0ede8;padding:12px 16px;margin-bottom:24px;border-left:3px solid #111">
            <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Référence</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#111;font-weight:700">#${opts.orderId.slice(-8).toUpperCase()}</p>
          </div>
          <div style="background:#f0faf4;border:1px solid #b8dfc6;border-left:3px solid #2d6a3f;padding:14px 16px;margin-bottom:24px">
            <p style="margin:0;font-size:13px;color:#2d6a3f;font-weight:600">
              Montant débité : ${opts.total.toLocaleString("fr-FR")} €
            </p>
          </div>
          <p style="font-size:12px;color:#999;line-height:1.7">
            Questions : <a href="mailto:${process.env.STORE_EMAIL || "contact@trancendstore.com"}" style="color:#111">${process.env.STORE_EMAIL || "contact@trancendstore.com"}</a>
          </p>
        </td></tr>
        <tr>
          <td style="background:#f0ede8;padding:20px 36px;border-top:1px solid #ccc9c2">
            <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#888">
              © ${new Date().getFullYear()} TRÄNCËNÐ
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
