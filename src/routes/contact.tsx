import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";

export default function Contact() {
  const [form, setForm] = createSignal({ name: "", email: "", message: "" });
  const [sent, setSent] = createSignal(false);

  function handleSubmit(e: Event) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <>
      <Title>Contact — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header">
            <h1 class="page-title">CONTACT</h1>
            <p class="page-subtitle">NOUS SOMMES LÀ POUR VOUS</p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start">
            <div>
              {sent() ? (
                <div style="font-family:var(--font-mono);font-size:14px;color:var(--accent);letter-spacing:0.12em;text-transform:uppercase;padding:48px 0">
                  ✓ MESSAGE ENVOYÉ — Nous vous répondrons sous 48h.
                </div>
              ) : (
                <form onSubmit={handleSubmit} style="display:flex;flex-direction:column;gap:20px">
                  <div>
                    <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gray-4);display:block;margin-bottom:8px">
                      NOM COMPLET
                    </label>
                    <input
                      type="text"
                      required
                      style="width:100%;background:var(--gray-1);border:1px solid var(--gray-2);padding:14px 16px;color:var(--white);font-size:14px;outline:none;transition:border-color 0.2s"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gray-4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gray-2)")}
                    />
                  </div>
                  <div>
                    <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gray-4);display:block;margin-bottom:8px">
                      EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      style="width:100%;background:var(--gray-1);border:1px solid var(--gray-2);padding:14px 16px;color:var(--white);font-size:14px;outline:none;transition:border-color 0.2s"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gray-4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gray-2)")}
                    />
                  </div>
                  <div>
                    <label style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gray-4);display:block;margin-bottom:8px">
                      MESSAGE
                    </label>
                    <textarea
                      required
                      rows="6"
                      style="width:100%;background:var(--gray-1);border:1px solid var(--gray-2);padding:14px 16px;color:var(--white);font-size:14px;outline:none;resize:vertical;transition:border-color 0.2s"
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gray-4)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "var(--gray-2)")}
                    />
                  </div>
                  <button
                    type="submit"
                    style="padding:18px;background:var(--white);color:var(--black);font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;transition:background 0.25s;border:none;cursor:pointer"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "var(--white)")}
                  >
                    ENVOYER LE MESSAGE →
                  </button>
                </form>
              )}
            </div>

            <div style="padding-top:8px">
              <div style="margin-bottom:40px">
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">
                  EMAIL
                </div>
                <a href="mailto:contact@trancendstore.com" style="font-size:15px;color:var(--white);transition:color 0.2s">
                  contact@trancendstore.com
                </a>
              </div>
              <div style="margin-bottom:40px">
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">
                  RÉSEAUX SOCIAUX
                </div>
                <div style="display:flex;flex-direction:column;gap:8px">
                  <a href="https://instagram.com/trancend.cg" target="_blank" style="font-size:14px;color:var(--gray-4);transition:color 0.2s">
                    Instagram — @trancend.cg
                  </a>
                  <a href="https://facebook.com/trancend.cg" target="_blank" style="font-size:14px;color:var(--gray-4);transition:color 0.2s">
                    Facebook — TRÄNCËNÐ
                  </a>
                </div>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">
                  LIVRAISON
                </div>
                <p style="font-size:14px;color:var(--gray-4);line-height:1.7">
                  Nous livrons à l'international. Délais variables selon la destination. 
                  Retours acceptés sous 14 jours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
