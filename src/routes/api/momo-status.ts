/**
 * /src/api/momo-status.ts
 * Route GET /api/momo-status?referenceId=xxx&orderData=JSON
 * 
 * SEULE responsabilité : vérifier le statut MoMo.
 * Si SUCCESSFUL → créer la commande PocketBase + envoyer emails.
 * Si FAILED     → rien créé.
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

// ── HANDLER GET ──────────────────────────────────────────────────

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const referenceId = url.searchParams.get("referenceId");
  const orderDataRaw = url.searchParams.get("orderData");

  if (!referenceId || !orderDataRaw) {
    return json({ error: "Paramètres manquants" }, { status: 400 });
  }

  let orderData: any;
  try {
    orderData = JSON.parse(decodeURIComponent(orderDataRaw));
  } catch {
    return json({ error: "orderData invalide" }, { status: 400 });
  }

  // ── 1. Vérifier le statut MoMo ───────────────────────────────
  let result: any;
  try {
    if (process.env.MOMO_DEV_BYPASS === "true" && referenceId.startsWith("bypass-")) {
      console.warn("[momo-status] DEV BYPASS — statut simulé: SUCCESSFUL");
      result = { status: "SUCCESSFUL" };
    } else {
      const res = await fetch(`http://localhost:4000/status/${referenceId}`);
      result = await res.json();
    }
    console.log("[momo-status] Statut MoMo:", result.status);
  } catch (err: any) {
    console.error("[momo-status] Erreur Bridge:", err.message);
    return json({ error: "Impossible de joindre le service de paiement" }, { status: 502 });
  }

  // ── 2. SUCCESSFUL → créer commande + emails ──────────────────
  if (result.status === "SUCCESSFUL") {
    try {
      await pbAdminAuth();

      // Anti-doublon : vérifier si déjà enregistré
      const existing = await pb.collection("orders")
        .getFirstListItem(`momo_reference_id="${referenceId}"`)
        .catch(() => null);

      if (existing) {
        console.log("[momo-status] Commande déjà existante:", existing.id);
        return json({ status: "SUCCESSFUL", orderId: existing.id });
      }

      // Créer la commande confirmée
      console.log("[momo-status] Création commande PocketBase...");
      const order = await pb.collection("orders").create({
        user: orderData.userId || null,
        customer_email: orderData.customerEmail,
        customer_name: orderData.customerName || "",
        status: "confirmed",
        shipping_address: orderData.shippingAddress,
        payment_method: "momo",
        retrait_mode: orderData.deliveryMode || "shipping",
        retrait_point: orderData.relayCity || "",
        relay_city: orderData.relayCity || "",
        shipping_fee: Math.round((orderData.shippingFee || 0) * 100),
        total: Math.round((orderData.total || 0) * 100),
        currency: "eur",
        momo_reference_id: referenceId,
        items: orderData.items || [],
      });

      console.log("[momo-status] Commande créée:", order.id);

      const email = orderData.customerEmail;
      const name = orderData.customerName || email;
      const total = orderData.total || 0;
      const fee = orderData.shippingFee || 0;

      // Email confirmation client
      if (email) {
        await sendEmail(
          email,
          `TRÄNCËNÐ — Commande confirmée #${order.id.slice(-8).toUpperCase()}`,
          buildClientConfirmEmail({
            name,
            orderId: order.id,
            total,
            shippingFee: fee,
            deliveryMode: orderData.deliveryMode,
            relayCity: orderData.relayCity || "",
            shippingAddress: orderData.shippingAddress,
            items: orderData.items || [],
          }),
          name,
        );
      }

      // Email propriétaire — nouvelle commande à traiter
      await sendEmail(
        STORE_EMAIL,
        `🛍️ Nouvelle commande MoMo — ${name} · ${total.toLocaleString("fr-FR")} €`,
        buildOwnerNotifEmail({
          orderId: order.id,
          customerName: name,
          customerEmail: email,
          total,
          shippingFee: fee,
          deliveryMode: orderData.deliveryMode,
          relayCity: orderData.relayCity || "",
          shippingAddress: orderData.shippingAddress,
          items: orderData.items || [],
        }),
        STORE_NAME,
      );

      return json({ status: "SUCCESSFUL", orderId: order.id });

    } catch (err) {
      console.error("[momo-status] Erreur finalisation:", err);
      return json({ status: "SUCCESSFUL", error: "Erreur enregistrement commande" });
    }
  }

  // ── 3. FAILED → rien créer ───────────────────────────────────
  if (result.status === "FAILED") {
    console.log("[momo-status] Paiement échoué — aucune commande créée");
  }

  return json({ status: result.status, reason: result.reason });
}

// ── TEMPLATE : Email client (confirmation) ───────────────────────

function buildClientConfirmEmail(opts: {
  name: string;
  orderId: string;
  total: number;
  shippingFee: number;
  deliveryMode: string;
  relayCity: string;
  shippingAddress: string;
  items: any[];
}) {
  const itemsHtml = (opts.items || []).map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;font-family:sans-serif;font-size:13px;color:#333">
        ${i.name}${i.size && i.size !== "UNIQUE" ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
        ${i.image ? `<br><img src="${i.image}" width="48" height="48" style="object-fit:cover;margin-top:6px;display:block;border:1px solid #e8e3dc">` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;text-align:right;font-family:sans-serif;font-size:13px;color:#333">
        x${i.quantity} · ${(i.price * i.quantity).toLocaleString("fr-FR")} €
      </td>
    </tr>`).join("");

  const deliveryLabel = opts.deliveryMode === "relay"
    ? `Point relais — nous vous confirmerons le point de retrait à <strong>${opts.relayCity}</strong> sous 24h.`
    : opts.shippingAddress;

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

          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">Commande confirmée ✓</h1>
          <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.6">
            Bonjour ${opts.name},<br>Votre paiement Mobile Money a été validé. Merci pour votre commande.
          </p>

          <div style="background:#f0ede8;padding:12px 16px;margin-bottom:24px;border-left:3px solid #111">
            <p style="margin:0;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Référence</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:14px;color:#111;font-weight:700">#${opts.orderId.slice(-8).toUpperCase()}</p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            <thead>
              <tr>
                <td style="font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em;padding-bottom:8px;border-bottom:2px solid #111">Article</td>
                <td style="font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em;padding-bottom:8px;border-bottom:2px solid #111;text-align:right">Montant</td>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Sous-total</td>
              <td style="font-size:13px;color:#666;text-align:right;padding:4px 0">${(opts.total - opts.shippingFee).toLocaleString("fr-FR")} €</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Livraison</td>
              <td style="font-size:13px;color:#666;text-align:right;padding:4px 0">${opts.shippingFee === 0 ? "Gratuit" : `+${opts.shippingFee} €`}</td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:700;color:#111;padding:10px 0 0;border-top:1px solid #ccc">TOTAL</td>
              <td style="font-size:15px;font-weight:700;color:#111;text-align:right;padding:10px 0 0;border-top:1px solid #ccc">${opts.total.toLocaleString("fr-FR")} €</td>
            </tr>
          </table>

          <div style="background:#f5f2ee;padding:14px 16px;border-left:3px solid #111;margin-bottom:24px">
            <p style="margin:0 0 4px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.16em">Livraison</p>
            <p style="margin:0;font-size:13px;color:#333;line-height:1.6">${deliveryLabel}</p>
          </div>

          <p style="font-size:12px;color:#999;line-height:1.7;margin:0">
            Questions : <a href="mailto:${STORE_EMAIL}" style="color:#111">${STORE_EMAIL}</a>
          </p>
        </td></tr>
        <tr><td style="background:#f0ede8;padding:16px 32px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">© ${new Date().getFullYear()} TRÄNCËNÐ — L'amour du dépassement</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── TEMPLATE : Email propriétaire (notification interne) ─────────

function buildOwnerNotifEmail(opts: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  shippingFee: number;
  deliveryMode: string;
  relayCity: string;
  shippingAddress: string;
  items: any[];
}) {
  const itemsHtml = (opts.items || []).map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e8e3dc;font-family:sans-serif;font-size:13px;color:#333">
        ${i.name}${i.size && i.size !== "UNIQUE" ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
        ${i.image ? `<br><img src="${i.image}" width="52" style="margin-top:4px;display:block">` : ""}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #e8e3dc;text-align:right;font-family:sans-serif;font-size:13px;color:#333;vertical-align:top">
        x${i.quantity}<br><strong>${(i.price * i.quantity).toLocaleString("fr-FR")} €</strong>
      </td>
    </tr>`).join("");

  const deliveryLabel = opts.deliveryMode === "relay"
    ? `Point relais — ${opts.relayCity}`
    : opts.shippingAddress;

  return `
<!DOCTYPE html><html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">

        <tr><td style="background:#111110;padding:20px 28px">
          <p style="margin:0;font-family:Georgia,serif;font-size:18px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ — Admin</p>
        </td></tr>

        <tr><td style="padding:28px">

          <!-- Alerte verte -->
          <div style="background:#f0faf4;border:1px solid #b8dfc6;border-left:4px solid #2d6a3f;padding:16px;margin-bottom:24px">
            <p style="margin:0;font-size:15px;font-weight:700;color:#2d6a3f">🛍️ Nouvelle commande MoMo à traiter</p>
            <p style="margin:4px 0 0;font-size:13px;color:#2d6a3f">Paiement confirmé · ${opts.total.toLocaleString("fr-FR")} €</p>
          </div>

          <!-- Référence + Client -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e8e3dc">
            <tr>
              <td style="padding:14px 16px;vertical-align:top;width:50%">
                <p style="margin:0 0 4px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Référence</p>
                <p style="margin:0;font-family:monospace;font-size:14px;font-weight:700;color:#111">#${opts.orderId.slice(-8).toUpperCase()}</p>
              </td>
              <td style="padding:14px 16px;vertical-align:top;border-left:1px solid #e8e3dc">
                <p style="margin:0 0 4px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Client</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#111">${opts.customerName}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#666">${opts.customerEmail}</p>
              </td>
            </tr>
            <tr style="border-top:1px solid #e8e3dc">
              <td colspan="2" style="padding:14px 16px">
                <p style="margin:0 0 4px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Livraison</p>
                <p style="margin:0;font-size:13px;color:#333">${deliveryLabel}</p>
              </td>
            </tr>
          </table>

          <!-- Articles -->
          <p style="margin:0 0 8px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Articles</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border-top:2px solid #111">
            <tbody>${itemsHtml}</tbody>
          </table>

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Sous-total</td>
              <td style="font-size:13px;color:#666;text-align:right">${(opts.total - opts.shippingFee).toLocaleString("fr-FR")} €</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Livraison</td>
              <td style="font-size:13px;color:#666;text-align:right">${opts.shippingFee === 0 ? "Gratuit" : `+${opts.shippingFee} €`}</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#111;padding:10px 0 0;border-top:2px solid #111">TOTAL PERÇU</td>
              <td style="font-size:16px;font-weight:700;color:#2d6a3f;text-align:right;padding:10px 0 0;border-top:2px solid #111">${opts.total.toLocaleString("fr-FR")} €</td>
            </tr>
          </table>

          <p style="font-size:11px;color:#999;line-height:1.7;margin:0">
            Paiement reçu via MTN Mobile Money. Commande à préparer et expédier.
          </p>

        </td></tr>

        <tr><td style="background:#f0ede8;padding:16px 28px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">© ${new Date().getFullYear()} TRÄNCËNÐ — Notification interne</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
