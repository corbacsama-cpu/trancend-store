import { createSignal } from "solid-js";

export default function Footer() {
  const [email, setEmail] = createSignal("");
  const [sent, setSent] = createSignal(false);

  function handleSubscribe(e: Event) {
    e.preventDefault();
    if (email()) {
      setSent(true);
      setEmail("");
    }
  }

  return (
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand-name">TRÄNCËNÐ</div>
            <p class="footer-tagline">
              L'amour du dépassement. Vêtements pensés pour ceux qui refusent les limites.
            </p>
            <div class="footer-social">
              <a href="https://instagram.com/trancend.cg" target="_blank" rel="noopener">IG</a>
              <a href="https://facebook.com/trancend.cg" target="_blank" rel="noopener">FB</a>
              <a href="https://youtube.com" target="_blank" rel="noopener">YT</a>
            </div>
          </div>

          <div>
            <div class="footer-col-title">Navigation</div>
            <ul class="footer-links">
              <li><a href="/shop">Shop</a></li>
              <li><a href="/shop?cat=tops">Tops</a></li>
              <li><a href="/shop?cat=bottoms">Bottoms</a></li>
              <li><a href="/shop?cat=sets">Sets & Dresses</a></li>
              <li><a href="/shop?cat=accessories">Accessories</a></li>
              <li><a href="/shop?cat=upcycling">Upcycling</a></li>
            </ul>
          </div>

          <div>
            <div class="footer-col-title">Informations</div>
            <ul class="footer-links">
              <li><a href="/about">À propos</a></li>
              <li><a href="/contact">Contact</a></li>
              <li><a href="/search">Recherche</a></li>
              <li><a href="/policies/shipping">Shipping Policy</a></li>
              <li><a href="/policies/refund">Remboursement</a></li>
              <li><a href="/policies/sales">Conditions de vente</a></li>
              <li><a href="/policies/legal">Mention légale</a></li>
              <li><a href="/policies/privacy">Privacy Policy</a></li>
              <li><a href="/policies/terms">Terms of Service</a></li>
              <li><a href="/policies/contact-info">Contact Information</a></li>
            </ul>
          </div>

          <div>
            <div class="footer-col-title">Newsletter</div>
            <p style="color:var(--gray-4);font-size:13px;line-height:1.6;margin-bottom:16px">
              Nouveautés et promotions directement dans votre boîte.
            </p>
            {sent() ? (
              <p style="font-family:var(--font-mono);font-size:11px;color:var(--accent);letter-spacing:0.1em;text-transform:uppercase">
                ✓ Inscription confirmée
              </p>
            ) : (
              <form class="footer-newsletter" onSubmit={handleSubscribe}>
                <input
                  class="footer-input"
                  type="email"
                  placeholder="votre@email.com"
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                  required
                />
                <button class="footer-newsletter-btn" type="submit">OK</button>
              </form>
            )}
          </div>
        </div>

        <div class="footer-bottom">
          <span class="footer-copyright">©️ 2025 TRÄNCËNÐ — L'amour du dépassement.</span>
          <div class="footer-payments">
            <span class="payment-badge">VISA</span>
            <span class="payment-badge">MC</span>
            <span class="payment-badge">PAYPAL</span>
            <span class="payment-badge">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
