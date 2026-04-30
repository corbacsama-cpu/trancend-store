import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, createEffect, createMemo, For, Show, onMount } from "solid-js";
import { cart, cartTotal, clearCart } from "~/lib/cart";
import { currentUser, authReady, getImageUrl } from "~/lib/pocketbase";
import { requireAuth } from "./auth";

// ── Types ──────────────────────────────────────────────────────
type DeliveryMode = "shipping" | "relay";
type PaymentMethod = "stripe" | "momo";

// ── Constantes ─────────────────────────────────────────────────
const SHIPPING_FEE_FRANCE = 3;
const SHIPPING_FEE_INTERNATIONAL = 12;

function isFrance(country: string) {
  const c = country.toLowerCase().trim();
  return c === "france" || c === "fr" || c.includes("france");
}

function getShippingFee(country: string): number {
  if (isFrance(country)) return SHIPPING_FEE_FRANCE;
  return SHIPPING_FEE_INTERNATIONAL;
}

function isCongo(country: string) {
  const c = country.toLowerCase().trim();
  return c.includes("congo") || c === "cg" || c === "cgo" || c.includes("brazzaville") || c.includes("pointe-noire");
}

export default function Checkout() {
  const navigate = useNavigate();

  // Adresse
  const [address, setAddress] = createSignal("");
  const [city, setCity] = createSignal("");
  const [country, setCountry] = createSignal("Congo (Brazzaville)"); // fallback
  const [zip, setZip] = createSignal("");
  const [email, setEmail] = createSignal(currentUser()?.email || "");
  const [name, setName] = createSignal(currentUser()?.name || "");
  const [geoLoading, setGeoLoading] = createSignal(true);

  // Livraison
  const [delivery, setDelivery] = createSignal<DeliveryMode>("shipping");
  const [relayCity, setRelayCity] = createSignal("");

  // Paiement
  const [payment, setPayment] = createSignal<PaymentMethod>("stripe");
  const [momoPhone, setMomoPhone] = createSignal("");

  // État
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [ready, setReady] = createSignal(false);

  // ── Géolocalisation IP → pays par défaut ─────────────────────
  onMount(async () => {
    try {
      // ipapi.co est gratuit, pas de clé requise, CORS ok
      const res = await fetch("https://ipapi.co/json/");
      if (res.ok) {
        const data = await res.json();
        if (data.country_name) {
          setCountry(data.country_name);
        }
      }
    } catch (_) {
      // Silencieux — le fallback "Congo (Brazzaville)" reste en place
    } finally {
      setGeoLoading(false);
    }
  });

  // ── Dérivés ──────────────────────────────────────────────────
  const showMomo = createMemo(() => isCongo(country()) || isCongo(relayCity()));
  const shippingFee = createMemo(() =>
    delivery() === "shipping" ? getShippingFee(country()) : 0
  );
  const total = createMemo(() => cartTotal() + shippingFee());

  // Auto MoMo si Congo
  createEffect(() => {
    if (showMomo()) setPayment("momo");
    else setPayment("stripe");
  });

  // Auth guard
  createEffect(() => {
    if (!authReady()) return;
    if (!requireAuth(navigate, "/check")) return;
    if (cart().length === 0) { navigate("/shop"); return; }
    setReady(true);
    // Pré-remplir email/nom depuis l'utilisateur connecté
    const user = currentUser();
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.name) setName(user.name);
    }
  });

  // ── Soumission ───────────────────────────────────────────────
  async function handleOrder(e: Event) {
    e.preventDefault();
    setError("");

    // Validation
    if (!email()) { setError("Veuillez saisir votre email."); return; }
    if (delivery() === "relay" && !relayCity().trim()) {
      setError("Veuillez indiquer votre ville pour le point relais."); return;
    }
    if (payment() === "momo" && !momoPhone().trim()) {
      setError("Veuillez saisir votre numéro Mobile Money."); return;
    }

    setLoading(true);
    try {
      const shippingAddr = delivery() === "shipping"
        ? `${address()}, ${zip()} ${city()}, ${country()}`
        : `Point relais — ville: ${relayCity()}`;

      const body = {
        items: cart().map((item) => ({
          productId: item.product.id,
          size: item.size || "UNIQUE",
          quantity: item.quantity,
          color: item.color || "",
          image: getImageUrl(item.product) || "",
        })),
        userId: currentUser()?.id,
        customerEmail: email(),
        customerName: name(),
        shippingAddress: shippingAddr,
        deliveryMode: delivery(),
        relayCity: delivery() === "relay" ? relayCity() : "",
        paymentMethod: payment(),
        shippingFee: shippingFee(),
        total: total(),
        ...(payment() === "momo" ? { momoPhone: momoPhone() } : {}),
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erreur lors du paiement");

      console.log("[check] checkout response:", data);

      if (payment() === "stripe" && data.url) {
        window.location.href = data.url;
      } else if (payment() === "momo" && data.momoReady) {
        console.log("[check] calling momo-pay with validatedOrder");

        const momoRes = await fetch("/api/momo-pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            validatedOrder: data.validatedOrder,
            momoPhone: momoPhone(),
          }),
        });
        const momoData = await momoRes.json();

        console.log("[check] momo-pay status:", momoRes.status, "data:", momoData);

        if (!momoRes.ok) throw new Error(momoData.error || "Erreur MoMo");
        if (!momoData.referenceId) throw new Error("referenceId manquant dans la réponse MoMo");

        console.log("[check] navigating to order-confirm...");
        navigate(
          `/order-confirm?method=momo&referenceId=${momoData.referenceId}&orderData=${encodeURIComponent(JSON.stringify(data.validatedOrder))}`
        );
      } else {
        throw new Error(`Réponse inattendue: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la commande");
    } finally {
      setLoading(false);
    }
  }

  const lbl = "auth-label";
  const inp = "auth-input";

  return (
    <>
      <Title>Commander — TRÄNCËNÐ</Title>

      <Show when={ready()} fallback={
        <div class="shop-page">
          <div class="container" style="padding:120px 0;text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:0.2em;color:var(--ink-3)">CHARGEMENT...</div>
        </div>
      }>
        <div class="shop-page">
          <div class="container">
            <div class="shop-header">
              <h1 class="page-title">COMMANDER</h1>
            </div>

            <div class="checkout-grid">
              {/* ── FORMULAIRE ── */}
              <form onSubmit={handleOrder} style="display:flex;flex-direction:column;gap:40px">

                <Show when={error()}>
                  <div class="auth-error">{error()}</div>
                </Show>

                {/* ── 1. INFORMATIONS PERSONNELLES ── */}
                <section class="checkout-section">
                  <div class="checkout-section-title">1 — VOS INFORMATIONS</div>
                  <div class="checkout-address-form">
                    <div class="checkout-row-2">
                      <div class="auth-field">
                        <label class={lbl}>NOM COMPLET</label>
                        <input class={inp} type="text" value={name()} onInput={e => setName(e.currentTarget.value)} placeholder="Prénom Nom" required />
                      </div>
                      <div class="auth-field">
                        <label class={lbl}>EMAIL</label>
                        <input class={inp} type="email" value={email()} onInput={e => setEmail(e.currentTarget.value)} placeholder="votre@email.com" required />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── 2. MODE DE LIVRAISON ── */}
                <section class="checkout-section">
                  <div class="checkout-section-title">2 — MODE DE LIVRAISON</div>

                  <div class="checkout-delivery-options">
                    {/* Expédition */}
                    <label class={`checkout-option ${delivery() === "shipping" ? "active" : ""}`}>
                      <input type="radio" name="delivery" value="shipping" checked={delivery() === "shipping"} onChange={() => setDelivery("shipping")} />
                      <div class="checkout-option-content">
                        <div class="checkout-option-title">Expédition à domicile</div>
                        <div class="checkout-option-desc">
                          Livraison partout dans le monde · +{getShippingFee(country())} €
                          {isFrance(country()) ? " (France)" : " (International)"}
                        </div>
                      </div>
                      <span class="checkout-option-badge">+{getShippingFee(country())} €</span>
                    </label>

                    {/* Point relais */}
                    <label class={`checkout-option ${delivery() === "relay" ? "active" : ""}`}>
                      <input type="radio" name="delivery" value="relay" checked={delivery() === "relay"} onChange={() => setDelivery("relay")} />
                      <div class="checkout-option-content">
                        <div class="checkout-option-title">Point relais</div>
                        <div class="checkout-option-desc">Indiquez votre ville — nous vous confirmons le point par email · Gratuit</div>
                      </div>
                      <span class="checkout-option-badge checkout-option-badge--free">Gratuit</span>
                    </label>
                  </div>

                  {/* Adresse si expédition */}
                  <Show when={delivery() === "shipping"}>
                    <div class="checkout-address-form">
                      <div class="auth-field">
                        <label class={lbl}>ADRESSE</label>
                        <input class={inp} type="text" value={address()} onInput={e => setAddress(e.currentTarget.value)} placeholder="123 Rue de la Paix" required />
                      </div>
                      <div class="checkout-row-2">
                        <div class="auth-field">
                          <label class={lbl}>VILLE</label>
                          <input class={inp} type="text" value={city()} onInput={e => setCity(e.currentTarget.value)} placeholder="Pointe-Noire" required />
                        </div>
                        <div class="auth-field">
                          <label class={lbl}>CODE POSTAL</label>
                          <input class={inp} type="text" value={zip()} onInput={e => setZip(e.currentTarget.value)} placeholder="00000" />
                        </div>
                      </div>
                      <div class="auth-field">
                        <label class={lbl}>
                          PAYS
                          <Show when={geoLoading()}>
                            <span style="font-family:var(--font-mono);font-size:8px;letter-spacing:0.1em;color:var(--ink-4);margin-left:8px;font-weight:normal">
                              détection...
                            </span>
                          </Show>
                        </label>
                        <input
                          class={inp}
                          type="text"
                          value={country()}
                          onInput={e => setCountry(e.currentTarget.value)}
                          placeholder="Votre pays"
                          required
                        />
                      </div>
                    </div>
                  </Show>

                  {/* Ville pour point relais */}
                  <Show when={delivery() === "relay"}>
                    <div class="checkout-address-form">
                      <div class="checkout-relay-info-box">
                        📍 Indiquez votre ville ci-dessous. Nous vous enverrons par email le point relais le plus proche ainsi que les instructions de retrait.
                      </div>
                      <div class="auth-field">
                        <label class={lbl}>VOTRE VILLE</label>
                        <input class={inp} type="text" value={relayCity()} onInput={e => setRelayCity(e.currentTarget.value)} placeholder="ex: Pointe-Noire, Brazzaville, Paris..." required />
                      </div>
                    </div>
                  </Show>
                </section>

                {/* ── 3. PAIEMENT ── */}
                <section class="checkout-section">
                  <div class="checkout-section-title">3 — PAIEMENT</div>

                  <div class="checkout-delivery-options">
                    {/* Stripe */}
                    <label class={`checkout-option ${payment() === "stripe" ? "active" : ""}`}>
                      <input type="radio" name="payment" value="stripe" checked={payment() === "stripe"} onChange={() => setPayment("stripe")} />
                      <div class="checkout-option-content">
                        <div class="checkout-option-title">Carte bancaire</div>
                        <div class="checkout-option-desc">Paiement sécurisé via Stripe · Visa, Mastercard, Apple Pay</div>
                      </div>
                      <div class="checkout-payment-icons">
                        <span class="checkout-payment-badge">VISA</span>
                        <span class="checkout-payment-badge">MC</span>
                      </div>
                    </label>

                    {/* MoMo — si Congo */}
                    <Show when={showMomo()}>
                      <label class={`checkout-option ${payment() === "momo" ? "active" : ""}`}>
                        <input type="radio" name="payment" value="momo" checked={payment() === "momo"} onChange={() => setPayment("momo")} />
                        <div class="checkout-option-content">
                          <div class="checkout-option-title">Mobile Money (MTN MoMo)</div>
                          <div class="checkout-option-desc">Paiement via votre numéro MTN Mobile Money</div>
                        </div>
                        <span class="checkout-payment-badge checkout-payment-badge--momo">MoMo</span>
                      </label>
                    </Show>
                  </div>

                  <Show when={payment() === "momo"}>
                    <div class="checkout-address-form">
                      <div class="auth-field">
                        <label class={lbl}>NUMÉRO MTN MOBILE MONEY</label>
                        <input class={inp} type="tel" value={momoPhone()} onInput={e => setMomoPhone(e.currentTarget.value)} placeholder="+242 06 XXX XX XX" required />
                      </div>
                      <div class="checkout-momo-info">
                        Vous recevrez une notification de paiement sur ce numéro. Validez la transaction pour confirmer votre commande.
                      </div>
                    </div>
                  </Show>

                  <Show when={payment() === "stripe"}>
                    <div class="checkout-stripe-info">
                      Vous serez redirigé vers la page de paiement sécurisée Stripe après validation.
                    </div>
                  </Show>
                </section>

                {/* ── BOUTON ── */}
                <button type="submit" class="auth-btn" disabled={loading()}>
                  <Show when={loading()} fallback={
                    <span>{payment() === "momo" ? "CONFIRMER — PAYER VIA MOMO" : "PAYER VIA STRIPE"} · {total().toLocaleString("fr-FR")} €  →</span>
                  }>
                    {payment() === "momo" ? "ENVOI EN COURS..." : "REDIRECTION STRIPE..."}
                  </Show>
                </button>

              </form>

              {/* ── RÉCAPITULATIF ── */}
              <div class="checkout-summary" style="position:sticky;top:calc(var(--nav-h) + 24px)">
                <div class="checkout-section-title" style="margin-bottom:16px">RÉCAPITULATIF</div>
                <div class="checkout-summary-card">
                  <For each={cart()}>{(item) => (
                    <div class="checkout-summary-item">
                      <div class="checkout-summary-img">
                        <Show when={item.product.images?.length > 0} fallback={<span style="font-size:18px;color:var(--ink-4)">⬡</span>}>
                          <img src={getImageUrl(item.product)} alt="" style="width:100%;height:100%;object-fit:cover" />
                        </Show>
                      </div>
                      <div style="flex:1;min-width:0">
                        <div class="checkout-summary-name">{item.product.name}</div>
                        <div class="checkout-summary-meta">
                          <Show when={item.color}>
                            <span style={`width:8px;height:8px;border-radius:50%;background:${item.color?.hex};border:1px solid var(--border);display:inline-block;flex-shrink:0`} />
                            {item.color?.name}
                          </Show>
                          <Show when={item.size && item.size !== "UNIQUE"}> · {item.size}</Show>
                          {" "}· Qté {item.quantity}
                        </div>
                        <div class="checkout-summary-price">{(item.product.price * item.quantity).toLocaleString("fr-FR")} €</div>
                      </div>
                    </div>
                  )}</For>

                  <div class="checkout-totals">
                    <div class="checkout-total-row">
                      <span>Sous-total</span>
                      <span>{cartTotal().toLocaleString("fr-FR")} €</span>
                    </div>
                    <div class="checkout-total-row">
                      <span>Livraison</span>
                      <span>{shippingFee() === 0 ? "Gratuit" : `+${shippingFee()} €`}</span>
                    </div>
                    <div class="checkout-total-row checkout-total-row--final">
                      <span>TOTAL</span>
                      <span>{total().toLocaleString("fr-FR")} €</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Show>
    </>
  );
}
