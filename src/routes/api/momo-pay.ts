/**
 * /src/api/momo-pay.ts
 * Route POST /api/momo-pay
 * Déclenche le Request To Pay MoMo et retourne le referenceId
 */
import { json } from "@solidjs/router";
import { v4 as uuidv4 } from "uuid";
import PocketBase from "pocketbase";
import { requestMomoPayment, getMomoPaymentStatus } from "~/lib/momo";

const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

/** Authentifie le client PB en superuser pour les opérations d'update */
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
const MOMO_CURRENCY = process.env.MOMO_CURRENCY || "EUR";

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

export async function POST({ request }: { request: Request }) {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: "Corps invalide" }, { status: 400 }); }

  const { orderId, momoPhone } = body;

  if (!orderId)   return json({ error: "orderId manquant" },   { status: 400 });
  if (!momoPhone) return json({ error: "momoPhone manquant" }, { status: 400 });

  // Récupérer la commande
  let order: any;
  try {
    order = await pb.collection("orders").getOne(orderId);
  } catch {
    return json({ error: "Commande introuvable" }, { status: 404 });
  }

  // Accepter "pending" ET "pending_momo" (au cas où le status est déjà correct)
  if (!["pending", "pending_momo"].includes(order.status)) {
    return json({ error: "Commande déjà traitée" }, { status: 409 });
  }

  // Nettoyer le numéro (supprimer +, espaces)
  const msisdn = momoPhone.replace(/[\s+\-()]/g, "");

  const referenceId = uuidv4();
  const amount      = String(Math.round(order.total));

  try {
    await requestMomoPayment(
      {
        amount,
        currency:     MOMO_CURRENCY,
        externalId:   orderId,
        partyId:      msisdn,
        payerMessage: `TRÄNCËNÐ — Commande #${orderId.slice(-8).toUpperCase()}`,
        payeeNote:    `Order ${orderId}`,
      },
      referenceId,
    );
  } catch (err: any) {
    console.error("[momo-pay] requestToPay error:", err);

    // En développement local : le WAF MTN bloque les IPs résidentielles.
    // Si MOMO_DEV_BYPASS=true, on simule un succès pour tester le reste du flow.
    if (process.env.MOMO_DEV_BYPASS === "true") {
      console.warn("[momo-pay] DEV BYPASS actif — simulation paiement MoMo accepté");
      await pbAdminAuth();
      await pb.collection("orders").update(orderId, {
        momo_reference_id: referenceId,
        status:            "pending_momo",
      });
      return json({ success: true, referenceId, bypassed: true });
    }

    return json({ error: err.message || "Erreur MoMo" }, { status: 502 });
  }

  // Sauvegarder le referenceId dans la commande pour le polling
  await pbAdminAuth();
  await pb.collection("orders").update(orderId, {
    momo_reference_id: referenceId,
    status: "pending_momo",
  });

  return json({ success: true, referenceId });
}
