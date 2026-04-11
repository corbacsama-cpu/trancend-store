import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";

export default function Contact() {
  const [sent, setSent]       = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError]     = createSignal("");
  const [formName, setFormName]       = createSignal("");
  const [formEmail, setFormEmail]     = createSignal("");
  const [formMessage, setFormMessage] = createSignal("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:    formName(),
          email:   formEmail(),
          message: formMessage(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");

      setSent(true);
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = "width:100%;background:transparent;border:none;border-bottom:1px solid var(--border-dark);padding:10px 0;color:var(--ink);font-size:13px;font-family:var(--font-body);outline:none;transition:border-color 0.2s";
  const labelStyle = "font-family:var(--font-mono);font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:var(--ink-3);display:block;margin-bottom:8px";

  return (
    <>
      <Title>Contact — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header">
            <h1 class="page-title">CONTACT</h1>
            <p class="page-subtitle">NOUS SOMMES LÀ POUR VOUS</p>
          </div>

          <div class="contact-grid">
            {/* Formulaire */}
            <div>
              {sent() ? (
                <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink);padding:48px 0;border-top:1px solid var(--border)">
                  ✓ MESSAGE ENVOYÉ — Nous vous répondrons sous 48h.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style="display:flex;flex-direction:column;gap:24px">
                  {error() && (
                    <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em;color:#b03020;padding:12px 16px;border:1px solid #f0c0b8;background:#fdf0f0">
                      {error()}
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>NOM COMPLET</label>
                    <input type="text" required style={inputStyle}
                      value={formName()}
                      onInput={e => setFormName(e.currentTarget.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={e  => (e.currentTarget.style.borderColor = "var(--border-dark)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>EMAIL</label>
                    <input type="email" required style={inputStyle}
                      value={formEmail()}
                      onInput={e => setFormEmail(e.currentTarget.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={e  => (e.currentTarget.style.borderColor = "var(--border-dark)")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>MESSAGE</label>
                    <textarea required rows="6"
                      style={`${inputStyle};resize:vertical`}
                      value={formMessage()}
                      onInput={e => setFormMessage(e.currentTarget.value)}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--ink)")}
                      onBlur={e  => (e.currentTarget.style.borderColor = "var(--border-dark)")}
                    />
                  </div>
                  <button type="submit" disabled={loading()}
                    style="padding:16px;background:var(--ink);color:var(--bg);font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;border:none;cursor:pointer;transition:opacity 0.2s"
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    {loading() ? "ENVOI EN COURS..." : "ENVOYER LE MESSAGE →"}
                  </button>
                </form>
              )}
            </div>

            {/* Infos */}
            <div style="display:flex;flex-direction:column;gap:36px">
              <div>
                <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px">EMAIL</div>
                <a href="mailto:contact@trancendstore.com" style="font-size:14px;color:var(--ink);border-bottom:1px solid var(--border-dark);padding-bottom:2px">
                  contact@trancendstore.com
                </a>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px">RÉSEAUX SOCIAUX</div>
                <div style="display:flex;flex-direction:column;gap:8px">
                  <a href="https://instagram.com/trancend.cg" target="_blank" style="font-size:13px;color:var(--ink-2)">Instagram — @trancend.cg</a>
                  <a href="https://facebook.com/trancend.cg" target="_blank" style="font-size:13px;color:var(--ink-2)">Facebook — TRÄNCËNÐ</a>
                </div>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:9px;letter-spacing:0.24em;text-transform:uppercase;color:var(--ink-3);margin-bottom:12px">LIVRAISON</div>
                <p style="font-size:13px;color:var(--ink-2);line-height:1.8">
                  Nous livrons à l'international. Délais variables selon la destination. Retours acceptés sous 14 jours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
