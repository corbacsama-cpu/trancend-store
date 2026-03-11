import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function CheckoutCancel() {
  return (
    <>
      <Title>Paiement annulé — TRÄNCËNÐ</Title>
      <div class="result-shell">
        <div class="result-card result-card--cancel">
          <div class="result-icon result-icon--cancel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 class="result-title">Paiement annulé</h1>
          <p class="result-message">
            Le paiement a été annulé. Aucun montant n'a été débité.
            Ton panier est toujours disponible.
          </p>

          <div class="result-actions">
            <A href="/checkout" class="result-btn result-btn--primary">
              RÉESSAYER
            </A>
            <A href="/shop" class="result-btn result-btn--ghost">
              CONTINUER LES ACHATS
            </A>
          </div>
        </div>
      </div>
    </>
  );
}
