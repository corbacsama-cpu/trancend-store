import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, For, Show, onMount } from "solid-js";
import { cart, cartTotal, clearCart } from "~/lib/cart";
import { currentUser, createOrder, getImageUrl } from "~/lib/pocketbase";

export default function Checkout() {
  const navigate = useNavigate();
  const [address, setAddress] = createSignal("");
  const [city, setCity] = createSignal("");
  const [country, setCountry] = createSignal("Congo (Brazzaville)");
  const [zip, setZip] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  onMount(() => {
    if (!currentUser()) navigate("/auth/login");
    if (cart().length === 0) navigate("/shop");
  });

  async function handleOrder(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const shippingAddr = `${address()}, ${zip()} ${city()}, ${country()}`;
      await createOrder(cart(), cartTotal(), shippingAddr);
      clearCart();
      navigate("/account");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Title>Commander — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header">
            <h1 class="page-title">COMMANDER</h1>
          </div>

          <div style="display:grid;grid-template-columns:1fr 400px;gap:60px;align-items:start">
            {/* Form */}
            <form onSubmit={handleOrder}>
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:24px">
                ADRESSE DE LIVRAISON
              </div>

              {error() && (
                <div class="auth-error" style="margin-bottom:24px">{error()}</div>
              )}

              <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:40px">
                <div class="auth-field">
                  <label class="auth-label">ADRESSE</label>
                  <input class="auth-input" type="text" value={address()} onInput={(e) => setAddress(e.currentTarget.value)} placeholder="123 Rue de la Paix" required />
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                  <div class="auth-field">
                    <label class="auth-label">VILLE</label>
                    <input class="auth-input" type="text" value={city()} onInput={(e) => setCity(e.currentTarget.value)} placeholder="Pointe-Noire" required />
                  </div>
                  <div class="auth-field">
                    <label class="auth-label">CODE POSTAL</label>
                    <input class="auth-input" type="text" value={zip()} onInput={(e) => setZip(e.currentTarget.value)} placeholder="00000" />
                  </div>
                </div>
                <div class="auth-field">
                  <label class="auth-label">PAYS</label>
                  <input class="auth-input" type="text" value={country()} onInput={(e) => setCountry(e.currentTarget.value)} required />
                </div>
              </div>

              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:16px">
                PAIEMENT
              </div>
              <div style="background:var(--gray-1);border:1px solid var(--gray-2);padding:20px;font-family:var(--font-mono);font-size:12px;color:var(--gray-4);letter-spacing:0.1em;margin-bottom:32px">
                Paiement sécurisé à la livraison ou par virement. Notre équipe vous contactera pour finaliser le paiement.
              </div>

              <button type="submit" class="auth-btn" disabled={loading()}>
                {loading() ? "TRAITEMENT EN COURS..." : `CONFIRMER LA COMMANDE — ${cartTotal().toLocaleString("fr-FR")} € →`}
              </button>
            </form>

            {/* Order summary */}
            <div style="position:sticky;top:calc(var(--nav-h) + 24px)">
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:20px">
                RÉCAPITULATIF
              </div>
              <div style="background:var(--gray-1);padding:24px">
                <For each={cart()}>
                  {(item) => (
                    <div style="display:flex;gap:16px;padding:12px 0;border-bottom:1px solid var(--gray-2)">
                      <div style="width:60px;height:75px;background:var(--gray-2);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:20px;color:var(--gray-3)">
                        <Show when={item.product.images?.length > 0}
                          fallback={<span>⬡</span>}>
                          <img src={getImageUrl(item.product)} alt="" style="width:100%;height:100%;object-fit:cover" />
                        </Show>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div style="font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px">{item.product.name}</div>
                        <div style="font-family:var(--font-mono);font-size:10px;color:var(--gray-4);display:flex;gap:8px;align-items:center;flex-wrap:wrap"><Show when={item.color}><span style={`width:8px;height:8px;border-radius:50%;background:${item.color?.hex};border:1px solid rgba(255,255,255,0.2);display:inline-block`} />{item.color?.name}</Show><Show when={item.size && item.size !== "UNIQUE"}>· Taille: {item.size}</Show>· Qté: {item.quantity}</div>
                        <div style="font-family:var(--font-mono);font-size:12px;color:var(--accent);margin-top:6px">{(item.product.price * item.quantity).toLocaleString("fr-FR")} €</div>
                      </div>
                    </div>
                  )}
                </For>
                <div style="display:flex;justify-content:space-between;padding-top:16px;font-family:var(--font-mono);font-size:14px;font-weight:700;letter-spacing:0.1em">
                  <span>TOTAL</span>
                  <span style="color:var(--accent)">{cartTotal().toLocaleString("fr-FR")} €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
