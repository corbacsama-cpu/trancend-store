import { Title } from "@solidjs/meta";
import { A, useSearchParams } from "@solidjs/router";
import { onMount } from "solid-js";
import { setCart } from "~/lib/cart";

// Ensure you import your CSS file here (e.g. "./success.css")
import "./succes.css";

export default function CheckoutSuccess() {
  const [params] = useSearchParams();

  // Clear the cart once payment is confirmed
  onMount(() => {
    setCart([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("trancend_cart");
    }
  });

  return (
    <>
      <Title>Commande confirmée — TRÄNCËNÐ</Title>

      {/* Container with a subtle background ambient glow */}
      <div class="result-shell">
        <div class="ambient-glow"></div>

        {/* Main Glassmorphic Card */}
        <div class="result-card result-card--glass">

          <div class="result-header">
            {/* Animated Checkmark Icon */}
            <div class="result-icon-wrapper">
              <svg
                class="animated-check"
                viewBox="0 0 52 52"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle class="check-circle" cx="26" cy="26" r="25" fill="none" />
                <path class="check-path" stroke-linecap="round" stroke-linejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>

            <p class="result-eyebrow">TRÄNCËNÐ • MERCI</p>
            <h1 class="result-title">
              <span class="text-gradient">Paiement</span><br />
              confirmé
            </h1>

            <p class="result-message">
              Tu vas recevoir un email de confirmation sous peu.<br />
              Nous préparons ton colis avec soin.
            </p>
          </div>

          {/* Reference chip styled as a modern container box */}
          {typeof params.session_id === "string" && (
            <div class="result-ref">
              <span class="result-ref-label">Référence commande</span>
              <span class="result-ref-val">{params.session_id.slice(-12).toUpperCase()}</span>
            </div>
          )}

          {/* Connected timeline progress bar */}
          <div class="result-timeline">
            <div class="timeline-step is-complete">
              <div class="timeline-dot"></div>
              <span class="timeline-label">Paiement</span>
            </div>

            <div class="timeline-line is-active"></div>

            <div class="timeline-step is-complete">
              <div class="timeline-dot"></div>
              <span class="timeline-label">Enregistrée</span>
            </div>

            <div class="timeline-line"></div>

            <div class="timeline-step is-pending">
              <div class="timeline-dot"></div>
              <span class="timeline-label">Préparation</span>
            </div>

            <div class="timeline-line"></div>

            <div class="timeline-step is-pending">
              <div class="timeline-dot"></div>
              <span class="timeline-label">Expédition</span>
            </div>
          </div>

          {/* Actions with Shine Effects */}
          <div class="result-actions">
            <A href="/shop" class="btn btn-primary">
              <span class="btn-text">Continuer les achats</span>
              <div class="btn-shine"></div>
            </A>
            <A href="/" class="btn btn-ghost">
              Retour à l'accueil
            </A>
          </div>

        </div>
      </div>
    </>
  );
}
