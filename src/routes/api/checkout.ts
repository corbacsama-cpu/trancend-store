import { json } from "@solidjs/router";
import Stripe from "stripe";
import PocketBase from "pocketbase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(PB_URL);

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";

// ── Helpers ────────────────────────────────────────────────────

function getAllImageUrls(
  record: { collectionId: string; id: string },
  images?: string[],
): string[] {
  if (!images?.length) return [];
  return images.map((f) => pb.files.getURL(record as any, f));
}

/** Envoie un email transactionnel via Brevo */
async function sendEmail(to: string, subject: string, htmlContent: string, toName = "") {
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
  if (!res.ok) {
    const err = await res.text();
    console.error("[brevo] Send error:", err);
  }
}

/** Template email confirmation commande */
function buildOrderConfirmEmail(opts: {
  name: string;
  items: any[];
  shippingAddress: string;
  deliveryMode: string;
  relayCity: string;
  paymentMethod: string;
  total: number;
  shippingFee: number;
  orderId: string;
}): string {
  const itemsHtml = opts.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;font-family:sans-serif;font-size:13px;color:#333">
        ${i.name}${i.size !== "UNIQUE" ? ` · ${i.size}` : ""}${i.color ? ` · ${i.color}` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e3dc;text-align:right;font-family:sans-serif;font-size:13px;color:#333">
        x${i.quantity} · ${(i.price * i.quantity).toLocaleString("fr-FR")} €
      </td>
    </tr>`).join("");

  const deliveryLabel = opts.deliveryMode === "relay"
    ? `Point relais (ville: ${opts.relayCity}) — confirmation à venir par email`
    : opts.shippingAddress;

  const paymentLabel = opts.paymentMethod === "momo"
    ? "MTN Mobile Money"
    : "Carte bancaire (Stripe)";

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#111110;padding:28px 36px">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px">

            <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">
              Commande confirmée ✓
            </h1>
            <p style="margin:0 0 28px;font-size:13px;color:#666;line-height:1.6">
              Bonjour ${opts.name},<br>
              Merci pour votre commande. Voici le récapitulatif.
            </p>

            <!-- Référence -->
            <div style="background:#f0ede8;padding:12px 16px;margin-bottom:28px;border-left:3px solid #111">
              <p style="margin:0;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#888">
                Référence commande
              </p>
              <p style="margin:4px 0 0;font-family:monospace;font-size:13px;color:#111;font-weight:700">
                #${opts.orderId.slice(-8).toUpperCase()}
              </p>
            </div>

            <!-- Produits -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              <thead>
                <tr>
                  <td style="font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #111">ARTICLE</td>
                  <td style="font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888;padding-bottom:8px;border-bottom:2px solid #111;text-align:right">MONTANT</td>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>

            <!-- Totaux -->
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

            <!-- Livraison + Paiement -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px">
              <tr>
                <td width="50%" style="vertical-align:top;padding-right:16px">
                  <p style="margin:0 0 6px;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Livraison</p>
                  <p style="margin:0;font-size:13px;color:#333;line-height:1.6">${deliveryLabel}</p>
                </td>
                <td width="50%" style="vertical-align:top">
                  <p style="margin:0 0 6px;font-family:monospace;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#888">Paiement</p>
                  <p style="margin:0;font-size:13px;color:#333">${paymentLabel}</p>
                </td>
              </tr>
            </table>

            ${opts.deliveryMode === "relay" ? `
            <div style="background:#fff9e6;border:1px solid #f0d080;border-left:3px solid #f0b429;padding:14px 16px;margin-bottom:24px">
              <p style="margin:0;font-size:12px;color:#8a6000;line-height:1.6">
                📍 <strong>Point relais :</strong> Nous vous contacterons dans les 24h pour vous confirmer le point relais le plus proche de <strong>${opts.relayCity}</strong> et les instructions de retrait.
              </p>
            </div>` : ""}

            <p style="font-size:12px;color:#999;line-height:1.7;margin-bottom:0">
              Pour toute question : <a href="mailto:${STORE_EMAIL}" style="color:#111">${STORE_EMAIL}</a>
            </p>

          </td>
        </tr>

        <!-- Footer -->
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

// ── Handler POST ───────────────────────────────────────────────
export async function POST({ request }: { request: Request }) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const {
    items,
    userId,
    customerEmail,
    customerName,
    shippingAddress,
    deliveryMode,
    relayCity,
    paymentMethod,
    shippingFee,
    total,
    momoPhone,
  } = body;

  if (!items?.length) return json({ error: "Panier vide" }, { status: 400 });
  if (!customerEmail) return json({ error: "Email requis" }, { status: 400 });

  // ── Valider les produits ─────────────────────────────────────
  const lineItems: any[] = [];
  const validatedItems: any[] = [];

  try {
    for (const item of items) {
      const product = await pb.collection("product").getOne(item.productId).catch(() => null);
      if (!product) return json({ error: `Produit introuvable: ${item.productId}` }, { status: 404 });
      if (!product.in_stock) return json({ error: `Rupture de stock: ${product.name}` }, { status: 409 });
      if (item.quantity < 1 || item.quantity > 99) return json({ error: "Quantité invalide" }, { status: 400 });

      const images = getAllImageUrls(product, product.images);

      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name,
            description: `Taille: ${item.size}${item.color ? ` · Couleur: ${typeof item.color === "object" ? item.color.name : item.color}` : ""}`,
            images: images[0] ? [images[0]] : undefined,
            metadata: {
              product_id: product.id,
              size: item.size,
              color: item.color ? JSON.stringify(item.color) : "",
            },
          },
        },
        quantity: item.quantity,
      });

      validatedItems.push({
        id: product.id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
        color: typeof item.color === "object" ? item.color.name : (item.color || ""),
        image: images[0] || "",
      });
    }
  } catch (err) {
    console.error("[checkout] PocketBase error:", err);
    return json({ error: "Erreur de validation des produits" }, { status: 500 });
  }

  // ── Frais de livraison en line item Stripe si shipping ────────
  if (deliveryMode === "shipping" && shippingFee > 0) {
    lineItems.push({
      price_data: {
        currency: "eur",
        unit_amount: Math.round(shippingFee * 100),
        product_data: { name: "Frais de livraison" },
      },
      quantity: 1,
    });
  }

  const origin = request.headers.get("origin") || "http://localhost:3000";

  const metadata = {
    userId: userId || "",
    customerEmail: customerEmail,
    customerName: customerName || "",
    shippingAddress: shippingAddress || "",
    deliveryMode: deliveryMode || "shipping",
    relayCity: relayCity || "",
    paymentMethod: paymentMethod || "stripe",
    shippingFee: String(shippingFee || 0),
    total: String(total || 0),
    momoPhone: momoPhone || "",
    items: JSON.stringify(validatedItems),
  };

  // ── Paiement MoMo — validation uniquement, PAS de création PocketBase ────
  // La commande sera créée dans momo-status.ts APRÈS confirmation du paiement
  if (paymentMethod === "momo") {
    const shippingAddrFull = deliveryMode === "relay"
      ? `Point relais — ville: ${relayCity}`
      : shippingAddress;

    console.log("[checkout] MoMo validated, returning data for momo-pay");

    // Retourner les données validées pour momo-pay.ts
    return json({
      success: true,
      momoReady: true,
      validatedOrder: {
        userId: userId || null,
        customerEmail,
        customerName: customerName || "",
        shippingAddress: shippingAddrFull,
        deliveryMode: deliveryMode || "shipping",
        relayCity: relayCity || "",
        paymentMethod: "momo",
        shippingFee: shippingFee || 0,
        total: total || 0,
        totalCents: Math.round((total || 0) * 100),
        currency: "eur",
        items: validatedItems,
      },
    });
  }

  // ── Paiement Stripe ──────────────────────────────────────────
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      locale: "fr",
      customer_email: customerEmail,
      metadata,
    });

    return json({ sessionId: session.id, url: session.url });
  } catch (err: any) {
    console.error("[checkout] Stripe error:", err);
    return json({ error: err?.message || "Erreur Stripe" }, { status: 500 });
  }
}
