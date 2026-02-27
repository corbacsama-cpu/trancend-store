import { createSignal, createEffect } from "solid-js";
import type { CartItem, Color, Product } from "./pocketbase";
import { syncCartToPB, loadCartFromPB, isLoggedIn } from "./pocketbase";

const [cart, setCart] = createSignal<CartItem[]>([]);
const [cartOpen, setCartOpen] = createSignal(false);
const [cartSyncing, setCartSyncing] = createSignal(false);

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("trancend_cart");
  if (stored) {
    try { setCart(JSON.parse(stored)); } catch {}
  }

  createEffect(() => {
    localStorage.setItem("trancend_cart", JSON.stringify(cart()));
  });

  createEffect(() => {
    const items = cart();
    if (isLoggedIn()) syncCartToPB(items);
  });
}

export { cart, cartOpen, setCartOpen, cartSyncing };

export async function mergeCartAfterLogin() {
  setCartSyncing(true);
  const pbItems = await loadCartFromPB();
  setCart((local) => {
    const merged = [...local];
    for (const pbItem of pbItems) {
      const exists = merged.find(
        (i) => i.product.id === pbItem.product.id && i.size === pbItem.size && i.color?.name === pbItem.color?.name
      );
      if (!exists) merged.push(pbItem);
    }
    return merged;
  });
  setCartSyncing(false);
}

export function addToCart(product: Product, color: Color, size: string, quantity = 1) {
  setCart((prev) => {
    const existing = prev.find(
      (i) => i.product.id === product.id && i.size === size && i.color?.name === color.name
    );
    if (existing) {
      return prev.map((i) =>
        i.product.id === product.id && i.size === size && i.color?.name === color.name
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    }
    return [...prev, { product, color, size, quantity }];
  });
  setCartOpen(true);
}

export function removeFromCart(productId: string, size: string, colorName: string) {
  setCart((prev) =>
    prev.filter((i) => !(i.product.id === productId && i.size === size && i.color?.name === colorName))
  );
}

export function updateQuantity(productId: string, size: string, colorName: string, quantity: number) {
  if (quantity <= 0) { removeFromCart(productId, size, colorName); return; }
  setCart((prev) =>
    prev.map((i) =>
      i.product.id === productId && i.size === size && i.color?.name === colorName
        ? { ...i, quantity }
        : i
    )
  );
}

export function clearCart() { setCart([]); }
export function cartTotal() { return cart().reduce((s, i) => s + i.product.price * i.quantity, 0); }
export function cartCount() { return cart().reduce((s, i) => s + i.quantity, 0); }
