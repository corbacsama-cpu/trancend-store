import { json } from "@solidjs/router";
import Stripe from "stripe";
import PocketBase from "pocketbase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const pb = new PocketBase(process.env.POCKETBASE_URL || "http://127.0.0.1:8090");

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";
const DEBUG = process.env.STRIPE_WEBHOOK_DEBUG === "true";

// ── Email helper ───────────────────────────────────────────────
async function sendEmail(to: string, subject: string, htmlContent: string, toName = "") {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: STORE_NAME, email: STORE_EMAIL },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent,
      }),
    });
    if (!res.ok) console.error("[brevo] Error:", await res.text());
    else console.log("[brevo] Email sent to:", to);
  } catch (err) {
    console.error("[brevo] Exception:", err);
  }
}

/** Template email confirmation commande (Stripe) */
function buildStripeConfirmEmail(opts: {
  name: string;
  items: any[];
  shippingAddress: string;
  deliveryMode: string;
  relayCity: string;
  total: number;
  shippingFee: number;
  orderId: string;
  sessionId: string;
}): string {
  const itemsHtml = opts.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;font-family:sans-serif;font-size:13px;color:#333">
        ${i.name}${i.size && i.size !== "UNIQUE" ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;text-align:right;font-family:sans-serif;font-size:13px;color:#333">
        x${i.quantity} · ${(i.price * i.quantity).toLocaleString("fr-FR")} €
      </td>
    </tr>`).join("");

  const deliveryLabel = opts.deliveryMode === "relay"
    ? `Point relais (ville: ${opts.relayCity}) — confirmation à venir`
    : opts.shippingAddress;

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8">
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
            Commande confirmée ✓
          </h1>
          <p style="margin:0 0 28px;font-size:13px;color:#666;line-height:1.6">
            Bonjour ${opts.name},<br>
            Votre paiement a été accepté. Merci pour votre commande.
          </p>

          <div style="background:#f0ede8;padding:12px 16px;margin-bottom:28px;border-left:3px solid #111">
            <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Référence</p>
            <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#111;font-weight:700">#${opts.orderId.slice(-8).toUpperCase()}</p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
            <thead>
              <tr>
                <td style="font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #111">ARTICLE</td>
                <td style="font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #111;text-align:right">MONTANT</td>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Sous-total</td>
              <td style="font-size:13px;color:#666;text-align:right;padding:4px 0">${(opts.total - opts.shippingFee).toLocaleString("fr-FR")} €</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0">Livraison</td>
              <td style="font-size:13px;color:#666;text-align:right;padding:4px 0">${opts.shippingFee === 0 ? "Gratuit" : `+${opts.shippingFee} €`}</td>
            </tr>
            <tr>
              <td style="font-size:15px;font-weight:700;color:#111;padding:12px 0 4px;border-top:1px solid #ccc">TOTAL</td>
              <td style="font-size:15px;font-weight:700;color:#111;text-align:right;padding:12px 0 4px;border-top:1px solid #ccc">${opts.total.toLocaleString("fr-FR")} €</td>
            </tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
            <tr>
              <td width="50%" style="vertical-align:top;padding-right:16px">
                <p style="margin:0 0 6px;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Livraison</p>
                <p style="margin:0;font-size:13px;color:#333;line-height:1.6">${deliveryLabel}</p>
              </td>
              <td width="50%" style="vertical-align:top">
                <p style="margin:0 0 6px;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Paiement</p>
                <p style="margin:0;font-size:13px;color:#333">Carte bancaire (Stripe)</p>
              </td>
            </tr>
          </table>

          ${opts.deliveryMode === "relay" ? `
          <div style="background:#fff9e6;border:1px solid #f0d080;border-left:3px solid #f0b429;padding:14px 16px;margin-bottom:24px">
            <p style="margin:0;font-size:12px;color:#8a6000;line-height:1.6">
              📍 <strong>Point relais :</strong> Nous vous contacterons dans les 24h pour confirmer le point relais le plus proche de <strong>${opts.relayCity}</strong>.
            </p>
          </div>` : ""}

          <p style="font-size:12px;color:#999;line-height:1.7">
            Questions : <a href="mailto:${STORE_EMAIL}" style="color:#111">${STORE_EMAIL}</a>
          </p>
        </td></tr>

        <tr>
          <td style="background:#f0ede8;padding:20px 36px;border-top:1px solid #ccc9c2">
            <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.16em;text-transform:uppercase;color:#888">
              © ${new Date().getFullYear()} TRÄNCËNÐ — L'amour du dépassement
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Webhook handler ────────────────────────────────────────────
export async function POST({ request }: { request: Request }) {
  try {
    const bodyBuffer = await request.arrayBuffer();
    const bodyRaw = Buffer.from(bodyBuffer);
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    if (signature && !DEBUG) {
      event = stripe.webhooks.constructEvent(
        bodyRaw,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } else {
      event = JSON.parse(new TextDecoder().decode(bodyBuffer)) as Stripe.Event;
      console.warn("⚠ Stripe signature skipped (debug mode)");
    }

    console.log("🔥 Webhook:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        console.warn("⚠ Not paid yet:", session.id);
        return json({ received: true });
      }

      // Anti-doublon
      const existing = await pb.collection("orders")
        .getFirstListItem(`stripe_session_id="${session.id}"`)
        .catch(() => null);

      if (existing) {
        console.warn("⚠ Order already exists:", session.id);
        return json({ received: true });
      }

      // Parser les items
      let parsedItems: any[] = [];
      try {
        parsedItems = JSON.parse(session.metadata?.items || "[]");
      } catch (e) {
        console.error("⚠ Invalid items JSON:", e);
      }

      const meta = session.metadata || {};
      const shippingFee = parseFloat(meta.shippingFee || "0");
      const total = parseFloat(meta.total || "0") || (session.amount_total ?? 0) / 100;

      // Créer la commande dans PocketBase
      const order = await pb.collection("orders").create({
        user: meta.userId || null,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent || null,
        customer_email: meta.customerEmail || session.customer_details?.email || "",
        customer_name: meta.customerName || session.customer_details?.name || "",
        total: session.amount_total,
        currency: session.currency,
        status: "confirmed",
        shipping_address: meta.shippingAddress || "",
        delivery_mode: meta.deliveryMode || "shipping",
        relay_city: meta.relayCity || "",
        payment_method: "stripe",
        shipping_fee: shippingFee,
        items: parsedItems,
      });

      console.log("✅ Order saved:", order.id);

      // Email confirmation au client
      const customerEmail = meta.customerEmail || session.customer_details?.email || "";
      const customerName = meta.customerName || session.customer_details?.name || "";

      if (customerEmail) {
        await sendEmail(
          customerEmail,
          `TRÄNCËNÐ — Commande confirmée #${order.id.slice(-8).toUpperCase()}`,
          buildStripeConfirmEmail({
            name: customerName || customerEmail,
            items: parsedItems,
            shippingAddress: meta.shippingAddress || "",
            deliveryMode: meta.deliveryMode || "shipping",
            relayCity: meta.relayCity || "",
            total,
            shippingFee,
            orderId: order.id,
            sessionId: session.id,
          }),
          customerName,
        );
      }

      // Email interne
      await sendEmail(
        STORE_EMAIL,
        `Nouvelle commande Stripe — ${customerName || customerEmail} · ${total} €`,
        `<p><strong>Client :</strong> ${customerName} (${customerEmail})</p>
         <p><strong>Total :</strong> ${total} €</p>
         <p><strong>Livraison :</strong> ${meta.shippingAddress}</p>
         <p><strong>Mode :</strong> ${meta.deliveryMode}${meta.relayCity ? ` — ${meta.relayCity}` : ""}</p>
         <p><strong>Session Stripe :</strong> ${session.id}</p>
         <p><strong>ID commande :</strong> ${order.id}</p>`,
        STORE_NAME,
      );
    }

    return json({ received: true });
  } catch (err: any) {
    console.error("[webhook] Error:", err);
    return json({ error: err.message }, { status: 400 });
  }
}
