import { json } from "@solidjs/router";
import Stripe from "stripe";
import PocketBase from "pocketbase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const pb = new PocketBase(PB_URL);

// Utilitaire pour récupérer les URLs d'image PocketBase
function getAllImageUrls(
  record: { collectionId: string; id: string },
  images?: string[],
): string[] {
  if (!images?.length) return [];
  return images.map((filename) => pb.files.getURL(record as any, filename));
}

export async function POST({ request }: { request: Request }) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { items, userId, shippingAddress } = body as {
    items: Array<{
      productId: string;
      size: string;
      quantity: number;
      color?: string;
    }>;
    userId?: string;
    shippingAddress?: string;
  };

  if (!items?.length) {
    return json({ error: "Panier vide" }, { status: 400 });
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const validatedItems: any[] = [];

  try {
    for (const item of items) {
      const product = await pb
        .collection("product")
        .getOne(item.productId)
        .catch(() => null);

      if (!product)
        return json(
          { error: `Produit introuvable: ${item.productId}` },
          { status: 404 },
        );
      if (!product.in_stock)
        return json(
          { error: `Produit en rupture de stock: ${product.name}` },
          { status: 409 },
        );
      if (item.quantity < 1 || item.quantity > 99)
        return json({ error: "Quantité invalide" }, { status: 400 });

      // Récupérer l'image principale
      const images = getAllImageUrls(product, product.images);
      const mainImage = images[0] || "";

      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name,
            description: `Taille: ${item.size} - Couleur: ${item.color || "N/A"}`,
            images: mainImage ? [mainImage] : undefined, // <-- image principale pour Stripe
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
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          collectionId: product.collectionId,
          images,
        },
        size: item.size,
        quantity: item.quantity,
        color: item.color || "",
      });
    }
  } catch (err: any) {
    console.error("[checkout] PocketBase error:", err);
    return json(
      { error: "Erreur de validation des produits" },
      { status: 500 },
    );
  }

  const metadata = {
    userId: userId || "",
    shippingAddress: shippingAddress || "",
    items: JSON.stringify(
      validatedItems.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        size: i.size,
        quantity: i.quantity,
        color: i.color ? JSON.stringify(i.color) : "",
        image: i.product.images?.[0] || "",
      })),
    ),
  };

  const origin = request.headers.get("origin") || "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      locale: "fr",
      metadata,
    });

    return json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("[checkout] Stripe error:", err);
    return json({ error: err?.message || "Erreur Stripe" }, { status: 500 });
  }
}
