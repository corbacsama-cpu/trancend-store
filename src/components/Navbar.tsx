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

  // Icon rendered on SSR (logged-out state) — same DOM shape as client default
  const AuthIconSSR = () => (
    <A href="/auth/login" class="navbar-icon-btn" title="Connexion">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </A>
  );

  return (
    <>
      <div class="announcement-bar">
        ★ LIVRAISON INTERNATIONALE DISPONIBLE &nbsp;·&nbsp; NOUVEAUX DROPS CHAQUE SAISON ★
      </div>
      <nav class="navbar">
        <div class="container navbar-inner">
          <A href="/" class="navbar-logo">TRÄNCËNÐ</A>

          <ul class="navbar-links">
            <li><A href="/" end>HOME</A></li>
            <li><A href="/shop">SHOP</A></li>
            <li><A href="/shop?cat=tops">TOPS</A></li>
            <li><A href="/shop?cat=bottoms">BOTTOMS</A></li>
            <li><A href="/shop?cat=sets">SETS</A></li>
            <li><A href="/shop?cat=accessories">ACCESSORIES</A></li>
            <li><A href="/about">ABOUT</A></li>
          </ul>

          <div class="navbar-actions">
            {/* Search — static, same on SSR and client */}
            <A href="/search" class="navbar-icon-btn" title="Recherche">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </A>

            {/* Auth icon — SSR always renders logged-out icon.
                Client swaps to account icon once authReady() resolves.
                Both branches render the SAME element type (an <a> tag) to avoid DOM mismatch. */}
            <Show
              when={!isServer && authReady() && currentUser()}
              fallback={<AuthIconSSR />}
            >
              <A href="/account" class="navbar-icon-btn" title="Mon compte">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </A>
            </Show>

            {/* Cart — badge only shown client-side after hydration */}
            <button class="navbar-cart-btn" onClick={() => setCartOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {/* Cart count — empty span on SSR, filled on client */}
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

      {/* Mobile menu */}
      <div class={`mobile-menu ${menuOpen() ? "open" : ""}`}>
        <A href="/" onClick={() => setMenuOpen(false)}>HOME</A>
        <A href="/shop" onClick={() => setMenuOpen(false)}>SHOP</A>
        <A href="/shop?cat=tops" onClick={() => setMenuOpen(false)}>TOPS</A>
        <A href="/shop?cat=bottoms" onClick={() => setMenuOpen(false)}>BOTTOMS</A>
        <A href="/shop?cat=sets" onClick={() => setMenuOpen(false)}>SETS</A>
        <A href="/shop?cat=accessories" onClick={() => setMenuOpen(false)}>ACCESSORIES</A>
        <A href="/shop?cat=upcycling" onClick={() => setMenuOpen(false)}>UPCYCLING</A>
        <A href="/about" onClick={() => setMenuOpen(false)}>ABOUT</A>
        <A href="/contact" onClick={() => setMenuOpen(false)}>CONTACT</A>
        {/* Mobile auth links — always render both, toggle visibility client-side */}
        <A href="/auth/login"
          onClick={() => setMenuOpen(false)}
          style={`display:${!isServer && authReady() && currentUser() ? "none" : "block"}`}>
          CONNEXION
        </A>
        <A href="/account"
          onClick={() => setMenuOpen(false)}
          style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"}`}>
          MON COMPTE
        </A>
        <button
          onClick={handleLogout}
          style={`display:${!isServer && authReady() && currentUser() ? "block" : "none"};font-family:var(--font-display);font-size:40px;letter-spacing:0.05em;color:var(--gray-4);padding:12px 0;border-bottom:1px solid var(--gray-2);text-align:left;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer;width:100%`}
        >
          DÉCONNEXION
        </button>
      </div>
    </>
  );
}
