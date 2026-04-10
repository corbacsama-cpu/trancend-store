/**
 * /src/routes/order-confirm.tsx
 * Page de confirmation MoMo — polling du statut toutes les 3s
 */
import { Title } from "@solidjs/meta";
import { A, useSearchParams } from "@solidjs/router";
import { createSignal, onMount, onCleanup, Show } from "solid-js";
import { clearCart } from "~/lib/cart";

type Status = "waiting" | "success" | "failed" | "error";

export default function OrderConfirm() {
  const [params] = useSearchParams();
  const getParam = (value: string | string[] | undefined, fallback = "") =>
    Array.isArray(value) ? (value[0] ?? fallback) : (value ?? fallback);
  const method  = () => getParam(params.method, "stripe");
  const orderId = () => getParam(params.orderId);
  const refId   = () => getParam(params.referenceId);

  const [status, setStatus]     = createSignal<Status>("waiting");
  const [reason, setReason]     = createSignal("");
  const [attempts, setAttempts] = createSignal(0);
  let timer: ReturnType<typeof setInterval>;

  function handleSuccess() {
    setStatus("success");
    clearInterval(timer);
    // Vider le panier côté client
    try { clearCart(); } catch (_) {}
  }

  
  // Polling toutes les 3s (max 40 tentatives = 2 min)
  async function poll() {
    if (!orderId() || !refId()) return;

    try {
      
      const res  = await fetch(
        `/api/momo-status?referenceId=${encodeURIComponent(refId())}&orderId=${encodeURIComponent(orderId())}`,
      );
      const data = await res.json();

      if (data.status === "SUCCESSFUL") {
        handleSuccess();
        return;
      }
      if (data.status === "FAILED") {
        setStatus("failed");
        setReason(data.reason || "Paiement refusé");
        clearInterval(timer);
        return;
      }

      // PENDING → continuer
      setAttempts(a => a + 1);
      if (attempts() >= 40) {
        setStatus("error");
        setReason("Délai dépassé. Contactez-nous si le montant a été débité.");
        clearInterval(timer);
      }
    } catch (err) {
      console.error("[poll]", err);
      setAttempts(a => a + 1);
    }
  }

  onMount(() => {
    if (method() === "stripe") {
      // Stripe → succès immédiat + vider panier
      handleSuccess();
      return;
    }
    if (orderId() && refId()) {
      poll();
      timer = setInterval(poll, 3000);
    } else {
      setStatus("error");
      setReason("Paramètres manquants.");
    }
  });

  onCleanup(() => clearInterval(timer));

  return (
    <>
      <Title>Confirmation — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div style="max-width:520px;margin:80px auto;text-align:center">

            {/* ── WAITING ── */}
            <Show when={status() === "waiting"}>
              <div class="order-confirm-icon order-confirm-icon--waiting">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h1 class="order-confirm-title">En attente de paiement</h1>
              <p class="order-confirm-desc">
                Une notification a été envoyée sur votre numéro MTN.<br />
                Veuillez valider le paiement sur votre téléphone.
              </p>
              <div class="order-confirm-spinner">
                <div class="order-confirm-dot" />
                <div class="order-confirm-dot" />
                <div class="order-confirm-dot" />
              </div>
              <p class="order-confirm-sub">Vérification en cours… ({attempts()}/40)</p>
            </Show>

            {/* ── SUCCESS ── */}
            <Show when={status() === "success"}>
              <div class="order-confirm-icon order-confirm-icon--success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h1 class="order-confirm-title">Commande confirmée ✓</h1>
              <p class="order-confirm-desc">
                Votre paiement a été validé. Un email de confirmation vous a été envoyé.
              </p>
              <Show when={orderId()}>
                <div class="order-confirm-ref">
                  Référence : <strong>#{orderId().slice(-8).toUpperCase()}</strong>
                </div>
              </Show>
              <A href="/shop" class="order-confirm-btn">CONTINUER LES ACHATS →</A>
            </Show>

            {/* ── FAILED ── */}
            <Show when={status() === "failed"}>
              <div class="order-confirm-icon order-confirm-icon--failed">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              </div>
              <h1 class="order-confirm-title">Paiement refusé</h1>
              <p class="order-confirm-desc">
                {reason() || "Le paiement MoMo a été refusé ou annulé."}<br />
                Vérifiez votre solde et réessayez.
              </p>
              <A href="/check" class="order-confirm-btn">RÉESSAYER →</A>
            </Show>

            {/* ── ERROR ── */}
            <Show when={status() === "error"}>
              <div class="order-confirm-icon order-confirm-icon--failed">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 9v4M12 17h.01"/>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                </svg>
              </div>
              <h1 class="order-confirm-title">Délai dépassé</h1>
              <p class="order-confirm-desc">{reason()}</p>
              <a href="mailto:contact@trancendstore.com" class="order-confirm-btn">
                CONTACTER LE SUPPORT →
              </a>
            </Show>

          </div>
        </div>
      </div>
    </>
  );
}
