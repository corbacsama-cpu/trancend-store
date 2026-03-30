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
          <A href="/" class="navbar-logo">
            <img src="/logo.png" alt="TRÄNCËNÐ" />
          </A>

          {/* CENTER: Nav links avec annotations manuscrites */}
          <ul class="navbar-links">

            {/* LAB — annotation "Home" au survol */}
            <li class="navbar-link-item">
              <A href="/" end>LAB</A>
              <div class="navbar-annotation">
                <svg class="navbar-handwriting" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="130" cy="128" rx="105" ry="22" stroke="#c0392b" stroke-width="0.8" opacity="0.7"/>
                  <path d="M 148 106 C 148 80, 120 50, 95 18" stroke="#c0392b" stroke-width="0.9" opacity="0.75" fill="none"/>
                  <path d="M 95 18 L 88 28 M 95 18 L 104 26" stroke="#c0392b" stroke-width="0.9" opacity="0.75" fill="none" stroke-linecap="round"/>
                  <text x="68" y="136" font-family="Georgia, serif" font-size="22" fill="#c0392b" opacity="0.75" font-style="italic" transform="rotate(-4, 130, 128)">Home</text>
                </svg>
              </div>
            </li>

            {/* GARMENTS — annotation "Shop" au survol */}
            <li class="navbar-link-item">
              <A href="/shop">GARMENTS</A>
              <div class="navbar-annotation">
                <svg class="navbar-handwriting" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="148" cy="128" rx="105" ry="22" stroke="#c0392b" stroke-width="0.8" opacity="0.6"/>
                  <path d="M 170 106 C 175 75, 165 45, 148 16" stroke="#c0392b" stroke-width="0.9" opacity="0.65" fill="none"/>
                  <path d="M 148 16 L 140 27 M 148 16 L 157 25" stroke="#c0392b" stroke-width="0.9" opacity="0.65" fill="none" stroke-linecap="round"/>
                  <text x="90" y="136" font-family="Georgia, serif" font-size="22" fill="#c0392b" opacity="0.65" font-style="italic" transform="rotate(-3, 148, 128)">Shop</text>
                </svg>
              </div>
            </li>

            <li><A href="/about">ARCHIVE</A></li>
            <li><A href="/about">PROCESS</A></li>
            <li><A href="/about">ABOUT</A></li>
          </ul>

          {/* RIGHT: Actions */}
          <div class="navbar-actions">
            <A href="/search" class="navbar-icon-btn" title="Recherche">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </A>

            <Show when={!isServer && authReady() && currentUser()} fallback={<AuthIconSSR />}>
              <A href="/account" class={`navbar-icon-btn ${currentUser() ? "active" : ""}`} title="Mon compte">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </A>
            </Show>

            <button class="navbar-cart-btn" onClick={() => setCartOpen(true)}>
              ({isServer ? "0" : cartCount()}) BAG
              <span class="cart-count" style={`display:${!isServer && cartCount() > 0 ? "flex" : "none"}`}>
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

      {/* ── MOBILE MENU ── */}
      <div class={`mobile-menu ${menuOpen() ? "open" : ""}`}>
        <div class="mobile-menu-header">
          <button class="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Fermer">✕</button>
          <A href="/" class="navbar-logo" onClick={() => setMenuOpen(false)}>
            <img src="/logo.png" alt="TRÄNCËNÐ" />
          </A>
        </div>

        <div class="mobile-menu-body">
          <nav class="mobile-menu-nav">
            <A href="/" class="mobile-menu-link" onClick={() => setMenuOpen(false)}>HOME</A>
            <A href="/shop" class="mobile-menu-link" onClick={() => setMenuOpen(false)}>SHOP</A>
            <A href="/about" class="mobile-menu-link" onClick={() => setMenuOpen(false)}>ABOUT</A>
            <A href="/contact" class="mobile-menu-link" onClick={() => setMenuOpen(false)}>CONTACT</A>

            <div class="mobile-menu-sep" />

            <A href="/auth/login" class="mobile-menu-link mobile-menu-link--small"
              onClick={() => setMenuOpen(false)}
              style={`display:${!isServer && authReady() && currentUser() ? "none" : "block"}`}>
              CONNEXION
            </A>
            <A href="/account" class="mobile-menu-link mobile-menu-link--small"
              onClick={() => setMenuOpen(false)}
              style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"}`}>
              MON COMPTE
            </A>
            <button class="mobile-menu-link mobile-menu-link--small mobile-logout"
              onClick={handleLogout}
              style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"}`}>
              DÉCONNEXION
            </button>
          </nav>

          <div class="mobile-menu-img-col">
            <div class="mobile-menu-img-wrap">
              <div class="mobile-menu-img-placeholder" />
            </div>
          </div>
        </div>

        <div class="mobile-menu-footer">
          <span class="mobile-menu-currency">XAF / EUR / USD</span>
        </div>
      </div>
    </>
  );
}
