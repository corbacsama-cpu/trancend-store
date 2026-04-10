import { json } from "@solidjs/router";
import Stripe from "stripe";
import PocketBase from "pocketbase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(PB_URL);


// ── Helpers ────────────────────────────────────────────────────

function getAllImageUrls(
  record: { collectionId: string; id: string },
  images?: string[],
): string[] {
  if (!images?.length) return [];
  return images.map((f) => pb.files.getURL(record as any, f));
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

  // ── Paiement MoMo ────────────────────────────────────────────
  if (paymentMethod === "momo") {
    try {
      const shippingAddrFull = deliveryMode === "relay"
        ? `Point relais (${relayCity}) — ${shippingAddress}`
        : shippingAddress;

      const orderData = {
        user: userId || null,
        customer_email: customerEmail,
        customer_name: customerName || "",
        status: "pending",
        shipping_address: shippingAddrFull,
        payment_method: "momo",
        retrait_mode: deliveryMode || "shipping",
        retrait_point: relayCity || "",
        relay_city: relayCity || "",   // champ alternatif au cas où
        total: Math.round((total || 0) * 100),
        currency: "eur",
        items: validatedItems,
      };

      console.log("[checkout] Creating MoMo order:", JSON.stringify(orderData, null, 2));

      const order = await pb.collection("orders").create(orderData);

      console.log("[checkout] MoMo order created:", order.id);

      // Retourner juste l'orderId — les emails et la confirmation
      // se font dans momo-status.ts après validation du paiement
      return json({ success: true, orderId: order.id });

    } catch (err: any) {
      console.error("[checkout] MoMo error full:", JSON.stringify({
        message: err?.message,
        status: err?.status,
        response: err?.response,
        data: err?.data,
      }, null, 2));
      return json({ error: err?.response?.message || err?.message || "Erreur commande MoMo" }, { status: 500 });
    }
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
