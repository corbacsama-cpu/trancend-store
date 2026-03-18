import { For, Show, createSignal, onMount } from "solid-js";
import { A } from "@solidjs/router";
import { cart, cartOpen, setCartOpen, cartTotal, removeFromCart, updateQuantity } from "~/lib/cart";
import { getImageUrl, currentUser, authReady } from "~/lib/pocketbase";

export default function CartDrawer() {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  return (
    <>
      <div
        class={`cart-overlay ${mounted() && cartOpen() ? "open" : ""}`}
        onClick={() => mounted() && setCartOpen(false)}
      />
      <aside class={`cart-drawer ${mounted() && cartOpen() ? "open" : ""}`}>

        <div class="cart-header">
          <span class="cart-header-title">PANIER</span>
          <button class="cart-close" onClick={() => mounted() && setCartOpen(false)}>✕</button>
        </div>

        <Show when={mounted()}>
          <Show
            when={cart().length > 0}
            fallback={
              <div class="cart-empty">
                <div class="cart-empty-icon">⬡</div>
                <span>Votre panier est vide</span>
                <A href="/shop" onClick={() => setCartOpen(false)}
                  style="font-family:var(--font-mono);font-size:9.5px;letter-spacing:0.14em;text-transform:uppercase;color:var(--ink);border-bottom:1px solid var(--ink);padding-bottom:2px;margin-top:6px">
                  DÉCOUVRIR →
                </A>
              </div>
            }
          >
            <div class="cart-items">
              <For each={cart()}>
                {(item) => (
                  <div class="cart-item">
                    <div class="cart-item-img">
                      <Show when={item.product.images?.length > 0}
                        fallback={<span style="font-size:20px;color:var(--ink-4)">⬡</span>}>
                        <img src={getImageUrl(item.product)} alt={item.product.name}
                          style="width:100%;height:100%;object-fit:cover" />
                      </Show>
                    </div>
                    <div class="cart-item-details">
                      <div class="cart-item-name">{item.product.name}</div>
                      <div style="display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap">
                        <Show when={item.color}>
                          <span class="cart-item-tag">
                            <span style={`width:7px;height:7px;border-radius:50%;background:${item.color.hex};border:1px solid var(--border);display:inline-block;flex-shrink:0`} />
                            {item.color.name}
                          </span>
                        </Show>
                        <Show when={item.size && item.size !== "UNIQUE"}>
                          <span class="cart-item-tag">{item.size}</span>
                        </Show>
                      </div>
                      <div class="cart-item-qty">
                        <button class="qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color?.name ?? "", item.quantity - 1)}>−</button>
                        <span style="font-family:var(--font-mono);font-size:12px;min-width:16px;text-align:center;color:var(--ink)">{item.quantity}</span>
                        <button class="qty-btn"
                          onClick={() => updateQuantity(item.product.id, item.size, item.color?.name ?? "", item.quantity + 1)}>+</button>
                        <button class="qty-btn" style="margin-left:auto;color:var(--ink-3)"
                          onClick={() => removeFromCart(item.product.id, item.size, item.color?.name ?? "")}>✕</button>
                      </div>
                      <div class="cart-item-price">{(item.product.price * item.quantity).toLocaleString("fr-FR")} €</div>
                    </div>
                  </div>
                )}
              </For>
            </div>

            <div class="cart-footer">
              <div class="cart-total-row">
                <span>TOTAL</span>
                <span class="cart-total-price">{cartTotal().toLocaleString("fr-FR")} €</span>
              </div>
              <Show
                when={authReady() && currentUser()}
                fallback={
                  <div>
                    <A href="/auth/login?redirect=/check" class="cart-checkout-btn" onClick={() => setCartOpen(false)}>
                      CONNEXION POUR COMMANDER →
                    </A>
                    <p style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink-3);text-align:center;margin-top:12px">
                      Créez un compte pour suivre vos commandes
                    </p>
                  </div>
                }
              >
                <A href="/check" class="cart-checkout-btn" onClick={() => setCartOpen(false)}>
                  COMMANDER →
                </A>
              </Show>
            </div>
          </Show>
        </Show>
      </aside>
    </>
  );
}
