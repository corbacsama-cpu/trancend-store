import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { isServer } from "solid-js/web";
import { cartOpen, setCartOpen, cartCount } from "~/lib/cart";
import { currentUser, authReady, logout } from "~/lib/pocketbase";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = createSignal(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate("/");
  }

  const AuthIconSSR = () => (
    <A href="/auth/login" class="navbar-icon-btn" title="Connexion">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </A>
  );

  return (
    <>
      <div class="announcement-bar">
        ★ LIVRAISON INTERNATIONALE DISPONIBLE &nbsp;·&nbsp; NOUVEAUX DROPS CHAQUE SAISON ★
      </div>

      <nav class="navbar">
        <div class="navbar-inner">

          {/* LEFT: Logo */}
          <A href="/" class="navbar-logo">TRÄNCËNÐ</A>

          {/* CENTER: Nav links */}
          <ul class="navbar-links">
            <li><A href="/" end>LAB</A></li>
            <li><A href="/shop">GARMENTS</A></li>
            <li><A href="/about">ARCHIVE</A></li>
            <li><A href="/about">PROCESS</A></li>
            <li><A href="/about">ABOUT</A></li>
          </ul>

          {/* RIGHT: Actions */}
          <div class="navbar-actions">
            <span class="navbar-divider" />

            <A href="/search" class="navbar-icon-btn" title="Recherche">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </A>

            <Show when={!isServer && authReady() && currentUser()} fallback={<AuthIconSSR />}>
              <A href="/account" class="navbar-icon-btn" title="Mon compte">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </A>
            </Show>

            <button class="navbar-cart-btn" onClick={() => setCartOpen(true)}>
              ({isServer ? "0" : cartCount()}) BAG
              <span
                class="cart-count"
                style={`display:${!isServer && cartCount() > 0 ? "flex" : "none"}`}
              >
                {isServer ? "" : cartCount()}
              </span>
            </button>

            <button
              class={`hamburger ${menuOpen() ? "open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div class={`mobile-menu ${menuOpen() ? "open" : ""}`}>
        <div class="mobile-menu-inner">
          <div class="mobile-menu-label">NAVIGATION</div>
          <A href="/" onClick={() => setMenuOpen(false)}>LAB</A>
          <A href="/shop" onClick={() => setMenuOpen(false)}>GARMENTS</A>
          <A href="/about" onClick={() => setMenuOpen(false)}>ARCHIVE</A>
          <A href="/about" onClick={() => setMenuOpen(false)}>PROCESS</A>
          <A href="/about" onClick={() => setMenuOpen(false)}>ABOUT</A>
          <A href="/contact" onClick={() => setMenuOpen(false)}>CONTACT</A>
          <div class="mobile-separator" />
          <A href="/auth/login" onClick={() => setMenuOpen(false)}
            style={`display:${!isServer && authReady() && currentUser() ? "none" : "block"}`}>
            CONNEXION
          </A>
          <A href="/account" onClick={() => setMenuOpen(false)}
            style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"}`}>
            MON COMPTE
          </A>
          <button class="mobile-logout" onClick={handleLogout}
            style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"}`}>
            DÉCONNEXION
          </button>
        </div>
      </div>
    </>
  );
}
