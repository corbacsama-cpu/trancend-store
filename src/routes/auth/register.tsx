import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { registerWithEmail } from "~/lib/pocketbase";
import { mergeCartAfterLogin } from "~/lib/cart";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    if (password() !== confirm()) { setError("Les mots de passe ne correspondent pas"); return; }
    if (password().length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères"); return; }
    setLoading(true);
    try {
      await registerWithEmail(email(), password(), name());
      await mergeCartAfterLogin();
      navigate("/account");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Title>Créer un compte — TRÄNCËNÐ</Title>
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">TRÄNCËNÐ</div>
          <h1 class="auth-title">CRÉER UN COMPTE</h1>
          <p class="auth-sub">Rejoignez la communauté</p>

          <form onSubmit={handleSubmit} class="auth-form">
            {error() && <div class="auth-error">{error()}</div>}

            <div class="auth-field">
              <label class="auth-label">NOM COMPLET</label>
              <input type="text" class="auth-input" value={name()} onInput={(e) => setName(e.currentTarget.value)} placeholder="Votre nom" required />
            </div>

            <div class="auth-field">
              <label class="auth-label">EMAIL</label>
              <input type="email" class="auth-input" value={email()} onInput={(e) => setEmail(e.currentTarget.value)} placeholder="votre@email.com" required autocomplete="email" />
            </div>

            <div class="auth-field">
              <label class="auth-label">MOT DE PASSE</label>
              <input type="password" class="auth-input" value={password()} onInput={(e) => setPassword(e.currentTarget.value)} placeholder="Min. 8 caractères" required autocomplete="new-password" />
            </div>

            <div class="auth-field">
              <label class="auth-label">CONFIRMER LE MOT DE PASSE</label>
              <input type="password" class="auth-input" value={confirm()} onInput={(e) => setConfirm(e.currentTarget.value)} placeholder="••••••••" required autocomplete="new-password" />
            </div>

            <button type="submit" class="auth-btn" disabled={loading()}>
              {loading() ? "CRÉATION..." : "CRÉER MON COMPTE →"}
            </button>
          </form>

          <div class="auth-footer">
            <span>Déjà un compte ?</span>
            <A href="/auth/login" class="auth-link">Se connecter →</A>
          </div>
        </div>
      </div>
    </>
  );
}
