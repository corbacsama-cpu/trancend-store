/**
 * /src/lib/momo.ts
 * MTN MoMo Collections API — sandbox + production
 * Docs: https://momodeveloper.mtn.com/docs/services/collection
 */

const MOMO_BASE_URL = process.env.MOMO_BASE_URL || "https://sandbox.momodeveloper.mtn.com";
const MOMO_PRIMARY_KEY = process.env.MOMO_PRIMARY_KEY!;  // Ocp-Apim-Subscription-Key
const MOMO_API_USER = process.env.MOMO_API_USER!;     // X-Reference-Id (UUID)
const MOMO_API_KEY_VAL = process.env.MOMO_API_KEY_VAL!;  // généré via /v1_0/apiuser/{id}/apikey
const MOMO_CURRENCY = process.env.MOMO_CURRENCY || "EUR"; // EUR en sandbox, XAF en prod Congo
const MOMO_ENV = process.env.MOMO_ENV || "sandbox"; // "sandbox" | "mtnpremiummoney"

/** Génère un token Bearer OAuth2 */
export async function getMomoToken(): Promise<string> {
  const credentials = Buffer.from(`${MOMO_API_USER}:${MOMO_API_KEY_VAL}`).toString("base64");

  const url = `${MOMO_BASE_URL}/collection/token/`;
  console.log("[momo] token URL:", url);
  console.log("[momo] API_USER:", MOMO_API_USER?.slice(0, 8), "...");
  console.log("[momo] PRIMARY_KEY:", MOMO_PRIMARY_KEY?.slice(0, 8), "...");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY,
      "Content-Length": "0",
    },
  });

  const text = await res.text();
  console.log("[momo] token status:", res.status);
  console.log("[momo] token response:", text.slice(0, 200));

  if (text.includes("<html") || text.includes("Request Rejected")) {
    throw new Error(
      `MoMo WAF rejection on token (${res.status}). Vérifiez MOMO_BASE_URL="${MOMO_BASE_URL}" et vos credentials.`
    );
  }

  if (!res.ok) {
    throw new Error(`MoMo token error (${res.status}): ${text}`);
  }

  const data = JSON.parse(text);
  return data.access_token as string;
}

export interface MomoRequestPayBody {
  amount: string;        // ex: "12.00"
  currency: string;      // "EUR" sandbox, "XAF" prod
  externalId: string;    // votre ID de commande
  partyId: string;       // numéro de téléphone MSISDN ex: "46733123450"
  payerMessage: string;  // affiché sur le téléphone client
  payeeNote: string;     // note interne
}

/**
 * Demande un paiement MoMo (Request to Pay)
 * Retourne le referenceId (UUID) à sauvegarder pour vérification
 */
export async function requestMomoPayment(

  body: MomoRequestPayBody,
  referenceId = crypto.randomUUID(),
): Promise<void> {
  const token = await getMomoToken();

  const url = `${MOMO_BASE_URL}/collection/v1_0/requesttopay`;
  console.log("[momo] POST", url);
  console.log("[momo] referenceId:", referenceId);
  console.log("[momo] env:", MOMO_ENV, "currency:", body.currency);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "X-Reference-Id": referenceId,
      "X-Target-Environment": MOMO_ENV,
      "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: body.amount,
      currency: body.currency,
      externalId: body.externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: body.partyId,
      },
      payerMessage: body.payerMessage,
      payeeNote: body.payeeNote,
    }),
  });

  const responseText = await res.text();
  console.log("[momo] requestToPay status:", res.status);
  console.log("[momo] requestToPay body:", responseText.slice(0, 300));

  // Détecter une réponse HTML (WAF / firewall) même avec status 200
  if (responseText.includes("<html") || responseText.includes("Request Rejected")) {
    throw new Error(
      `MoMo WAF rejection (status ${res.status}). Vérifiez MOMO_BASE_URL, MOMO_ENV et que votre IP n'est pas bloquée.`
    );
  }

  // 202 = Accepted (succès asynchrone)
  if (res.status !== 202) {
    throw new Error(`MoMo requestToPay error (${res.status}): ${responseText}`);
  }
}

export type MomoPaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED";

export interface MomoPaymentResult {
  status: MomoPaymentStatus;
  amount?: string;
  currency?: string;
  externalId?: string;
  reason?: string;
}

/** Vérifie le statut d'un paiement MoMo via son referenceId */
export async function getMomoPaymentStatus(referenceId: string): Promise<MomoPaymentResult> {
  const token = await getMomoToken();

  const res = await fetch(
    `${MOMO_BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "X-Target-Environment": MOMO_ENV,
        "Ocp-Apim-Subscription-Key": MOMO_PRIMARY_KEY,
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MoMo status error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return {
    status: data.status as MomoPaymentStatus,
    amount: data.amount,
    currency: data.currency,
    externalId: data.externalId,
    reason: data.reason,
  };
}