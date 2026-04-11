import { createSignal } from "solid-js";

export default function Footer() {
  const [email, setEmail]     = createSignal("");
  const [sent, setSent]       = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError]     = createSignal("");

  async function handleSubscribe(e: Event) {
    e.preventDefault();
    if (!email()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSent(true);
      setEmail("");
    } catch (err: any) {
      setError(err?.message || "Erreur, réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer class="footer">
      <div class="footer-rule" />
      <div class="footer-container">
        <div class="footer-main">

          {/* Left: brand */}
          <div class="footer-brand">
            <div class="footer-brand-name">TRÄNCËNÐ</div>
            <p class="footer-tagline">
              L'amour du dépassement.<br />
              Vêtements pensés pour ceux qui refusent les limites.
            </p>
            <div class="footer-social">
              <a href="https://instagram.com/trancend.cg" target="_blank" rel="noopener">IG</a>
              <span class="footer-social-dot">·</span>
              <a href="https://facebook.com/trancend.cg" target="_blank" rel="noopener">FB</a>
              <span class="footer-social-dot">·</span>
              <a href="https://youtube.com" target="_blank" rel="noopener">YT</a>
            </div>
          </div>

          {/* Center: info */}
          <div class="footer-col">
            <div class="footer-col-title">INFORMATIONS</div>
            <ul class="footer-links">
              <li><a href="/contact">Contact</a></li>
              <li><a href="/policies/shipping">Shipping</a></li>
              <li><a href="/policies/refund">Remboursement</a></li>
              <li><a href="/policies/legal">Mention légale</a></li>
              <li><a href="/policies/privacy">Privacy</a></li>
            </ul>
          </div>

          {/* Right: newsletter */}
          <div class="footer-col footer-col--newsletter">
            <div class="footer-col-title">NEWSLETTER</div>
            <p class="footer-newsletter-desc">
              Nouveautés et promotions directement dans votre boîte.
            </p>
            {sent() ? (
              <p class="footer-sent">✓ Inscription confirmée — bienvenue !</p>
            ) : (
              <>
                <form class="footer-newsletter-form" onSubmit={handleSubscribe}>
                  <input
                    class="footer-input"
                    type="email"
                    placeholder="votre@email.com"
                    value={email()}
                    onInput={e => setEmail(e.currentTarget.value)}
                    required
                  />
                  <button class="footer-newsletter-btn" type="submit" disabled={loading()}>
                    {loading() ? "..." : "NEWSLETTER →"}
                  </button>
                </form>
                {error() && (
                  <p style="margin:8px 0 0;font-family:var(--font-mono);font-size:9px;letter-spacing:0.1em;color:#b03020">
                    {error()}
                  </p>
                )}
              </>
            )}
          </div>

        </div>

        {/* Bottom bar */}
        <div class="footer-bottom">
          <span class="footer-copyright">© TRÄNCËNÐ LAB 2026</span>
          <div class="footer-bottom-links">
            <a href="/policies/shipping">SHIPPING</a>
            <span>·</span>
            <a href="/policies/refund">RETURNS</a>
            <span>·</span>
            <a href="/contact">CONTACT</a>
          </div>
          <div class="footer-barcode">
            <span class="footer-barcode-lines">
              {"| || ||| || | ||| || |".split("").map(c => c)}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
