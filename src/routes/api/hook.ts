import { json } from "@solidjs/router";
import Stripe from "stripe";
import PocketBase from "pocketbase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const pb = new PocketBase(
  process.env.POCKETBASE_URL || "http://127.0.0.1:8090",
);

// Mode debug pour tests manuels (curl)
const DEBUG = process.env.STRIPE_WEBHOOK_DEBUG === "true";

export async function POST({ request }: { request: Request }) {
  try {
    // Lire le body brut
    const bodyBuffer = await request.arrayBuffer();
    const bodyRaw = Buffer.from(bodyBuffer);

    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    // Vérification signature Stripe
    if (signature && !DEBUG) {
      event = stripe.webhooks.constructEvent(
        bodyRaw,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } else {
      // Mode debug
      const bodyJson = JSON.parse(new TextDecoder().decode(bodyBuffer));
      event = bodyJson as Stripe.Event;
      console.warn("⚠ Stripe signature skipped (debug mode)");
    }

    console.log("🔥 Webhook reçu :", event.type);

    // Gestion du checkout réussi
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("[webhook] Session completed:", session.id);

      // Vérifier que le paiement est réellement payé
      if (session.payment_status !== "paid") {
        console.warn("⚠ Session not paid yet:", session.id);
        return json({ received: true });
      }

      // Empêcher les doublons
      const existingOrder = await pb
        .collection("orders")
        .getFirstListItem(`stripe_session_id="${session.id}"`)
        .catch(() => null);

      if (existingOrder) {
        console.warn("⚠ Order already exists:", session.id);
        return json({ received: true });
      }

      // Parser les items envoyés dans metadata
     
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(session.metadata?.items || "[]").map((i: any) => ({
          ...i,
          color: i.color ? JSON.parse(i.color) : { name: "", hex: "" },
          image: i.image || "",
        }));
      } catch (e) {
        console.error("⚠ Invalid items JSON in metadata", e);
        parsedItems = [];
      }

      const orderData = {
        user: session.metadata?.userId || null,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent || null,
        total: session.amount_total,
        currency: session.currency,
        status: "confirmed",
        shipping_address: session.metadata?.shippingAddress || "",
        customer_email: session.customer_details?.email || "",
        items: parsedItems,
        
      };

      console.log("📦 Creating order:", orderData);

      await pb.collection("orders").create(orderData);

      console.log("✅ Order saved in PocketBase");
    }

    return json({ received: true });

    return json({ received: true });
  } catch (err: any) {
    console.error("[webhook] error", err);
    return json({ error: err.message }, { status: 400 });
  }
}
