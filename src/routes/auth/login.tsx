import { Title } from "@solidjs/meta";
import { A, useNavigate, useSearchParams } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { loginWithEmail } from "~/lib/pocketbase";
import { mergeCartAfterLogin } from "~/lib/cart";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isExpired = () => searchParams.expired === "1";
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const [loading, setLoading] = createSignal(false);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithEmail(email(), password());
      await mergeCartAfterLogin();
      navigate("/account");
    } catch (err: any) {
      setError(err?.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Title>Connexion — TRÄNCËNÐ</Title>
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-brand">TRÄNCËNÐ</div>
          <h1 class="auth-title">CONNEXION</h1>
          <p class="auth-sub">Bienvenue de retour</p>

          <Show when={isExpired()}>
            <div class="session-expired-banner">
              ⏱ Session expirée après 10 min d'inactivité.<br />Veuillez vous reconnecter.
            </div>
          </Show>

          <form onSubmit={handleSubmit} class="auth-form">
            {error() && (
              <div class="auth-error">{error()}</div>
            )}

            <div class="auth-field">
              <label class="auth-label">EMAIL</label>
              <input
                type="email"
                class="auth-input"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                placeholder="votre@email.com"
                required
                autocomplete="email"
              />
            </div>

            <div class="auth-field">
              <label class="auth-label">MOT DE PASSE</label>
              <input
                type="password"
                class="auth-input"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                placeholder="••••••••"
                required
                autocomplete="current-password"
              />
            </div>

            <button type="submit" class="auth-btn" disabled={loading()}>
              {loading() ? "CONNEXION..." : "SE CONNECTER →"}
            </button>
          </form>

          <div class="auth-footer">
            <span>Pas encore de compte ?</span>
            <A href="/auth/register" class="auth-link">Créer un compte →</A>
          </div>
        </div>
      </div>
    </>
  );
}
