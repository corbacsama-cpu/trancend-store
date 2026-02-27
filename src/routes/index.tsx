import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import ProductCard from "~/components/ProductCard";
import {
  getFeaturedProducts, getCategories, getHeroSlides,
  getCategoryImageUrl, getHeroSlideImageUrl, parseColors,
  MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_HERO_SLIDES,
  type HeroSlide, type Category, type Product,
} from "~/lib/pocketbase";
import { usePbData } from "~/lib/use-pb-resource";
import { addToCart } from "~/lib/cart";

const MARQUEE_ITEMS = [
  "LIVRAISON INTERNATIONALE","★","NOUVEAUX DROPS","★",
  "HANDCRAFTED IN CONGO","★","L'AMOUR DU DÉPASSEMENT","★","FREE RETURNS","★",
];

// ── HERO CAROUSEL ─────────────────────────────────────────────
function HeroCarousel(props: { slides: HeroSlide[] }) {
  const [current, setCurrent] = createSignal(0);
  const [prevIdx, setPrevIdx] = createSignal(-1);
  const [busy,    setBusy]    = createSignal(false);
  let timer: ReturnType<typeof setInterval>;

  const slides = () => props.slides.length > 0 ? props.slides : MOCK_HERO_SLIDES;

  function goTo(i: number) {
    if (busy() || i === current()) return;
    setPrevIdx(current()); setBusy(true); setCurrent(i);
    setTimeout(() => { setPrevIdx(-1); setBusy(false); }, 900);
  }
  const next = () => goTo((current() + 1) % slides().length);
  const prev = () => goTo((current() - 1 + slides().length) % slides().length);

  onMount (() => { timer = setInterval(next, 5000); });
  onCleanup(() => clearInterval(timer));
  const restart = () => { clearInterval(timer); timer = setInterval(next, 5000); };

  const GRADS = [
    "linear-gradient(135deg,#1a1a1a,#0a0a0a)",
    "linear-gradient(135deg,#0f0f0f,#1a1209)",
    "linear-gradient(135deg,#0a0a0a,#0f0d14)",
  ];

  return (
    <section class="hero">
      <For each={slides()}>
        {(slide, i) => {
          const url = getHeroSlideImageUrl(slide);
          return (
            <div class="hero-slide" style={{
              opacity: i() === current() ? "1" : i() === prevIdx() ? "0" : "0",
              "z-index": i() === current() ? "2" : i() === prevIdx() ? "1" : "0",
              transition: "opacity 0.9s cubic-bezier(0.4,0,0.2,1)",
            }}>
              {url
                ? <img src={url} class="hero-slide-img" alt={slide.title || ""} loading={i() === 0 ? "eager" : "lazy"} />
                : <div class="hero-slide-placeholder" style={{ background: GRADS[i() % GRADS.length] }} />
              }
              <div class="hero-slide-overlay" />
            </div>
          );
        }}
      </For>

      <div class="hero-grid-overlay" style="z-index:3" />

      <div class="container hero-content" style="position:relative;z-index:4">
        <p class="hero-eyebrow">{slides()[current()]?.title || "Collection 2025"}</p>
        <h1 class="hero-title">TRANS<br /><em>CEND</em></h1>
        <p class="hero-subtitle">{slides()[current()]?.subtitle || "Vêtements pensés pour ceux qui refusent les limites."}</p>
        <A href={slides()[current()]?.cta_url || "/shop"} class="hero-cta">
          {slides()[current()]?.cta_label || "DÉCOUVRIR LA COLLECTION"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </A>
      </div>

      <div style="position:absolute;bottom:32px;right:32px;z-index:5;display:flex;align-items:center;gap:16px">
        <button class="hero-nav-btn" onClick={() => { prev(); restart(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div style="display:flex;gap:8px;align-items:center">
          <For each={slides()}>{(_, i) =>
            <button class={`hero-dot ${current() === i() ? "active" : ""}`} onClick={() => { goTo(i()); restart(); }} />
          }</For>
        </div>
        <button class="hero-nav-btn" onClick={() => { next(); restart(); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <span style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.4)">
          {String(current()+1).padStart(2,"0")} / {String(slides().length).padStart(2,"0")}
        </span>
      </div>

      <div style="position:absolute;bottom:0;left:0;right:0;z-index:5;height:2px;background:rgba(255,255,255,0.08)">
        <div class="hero-progress-bar" style={{ width:`${((current()+1)/slides().length)*100}%` }} />
      </div>
    </section>
  );
}

// ── PRODUCT CAROUSEL ─────────────────────────────────────────
function ProductCarousel(props: { products: Product[]; loading: boolean }) {
  const [index, setIndex] = createSignal(0);
  const [drag,  setDrag]  = createSignal(false);
  const [sx,    setSx]    = createSignal(0);
  let timer: ReturnType<typeof setInterval>;

  const items  = () => props.products;
  const total  = () => Math.max(0, items().length - 3 + 1);

  onMount (() => { timer = setInterval(() => setIndex(i => (i+1) % Math.max(1,total())), 4000); });
  onCleanup(() => clearInterval(timer));

  const prev = () => { clearInterval(timer); setIndex(i => (i-1+total()) % total()); };
  const next = () => { clearInterval(timer); setIndex(i => (i+1) % Math.max(1,total())); };

  const iw = () => {
    if (typeof window === "undefined") return 33.333;
    if (window.innerWidth < 600) return 85;
    if (window.innerWidth < 900) return 50;
    return 33.333;
  };

  return (
    <Show
      when={!props.loading}
      fallback={
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">
          <For each={[1,2,3]}>{() => <div class="skeleton skeleton-card" />}</For>
        </div>
      }
    >
      <div class="carousel-root">
        <button class="carousel-btn carousel-btn-prev" onClick={prev}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button class="carousel-btn carousel-btn-next" onClick={next}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg></button>
        <div class="carousel-viewport" style="overflow:hidden;cursor:grab"
          onMouseDown={e => { setDrag(true); setSx(e.clientX); }}
          onMouseUp   ={e => { if (!drag()) return; setDrag(false); const d=e.clientX-sx(); if(d<-40)next(); if(d>40)prev(); }}
          onMouseLeave={() => setDrag(false)}>
          <div class="carousel-track" style={`transform:translateX(-${index()*iw()}%);transition:transform 0.5s cubic-bezier(0.4,0,0.2,1);display:flex`}>
            <For each={items()}>{p =>
              <div style={`flex:0 0 ${iw()}%;padding:0 8px;box-sizing:border-box`}>
                <ProductCard product={p} onQuickAdd={p => {
                  const c = parseColors(p.colors)[0] ?? { name:"Défaut", hex:"#0a0a0a" };
                  addToCart(p, c, p.sizes?.[0] || "UNIQUE");
                }} />
              </div>
            }</For>
          </div>
        </div>
        <div class="carousel-dots">
          <For each={Array.from({ length: total() })}>{(_, i) =>
            <button class={`carousel-dot ${index()===i() ? "active" : ""}`} onClick={() => { clearInterval(timer); setIndex(i()); }} />
          }</For>
        </div>
      </div>
    </Show>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────
export default function Home() {
  const { data: slides,     loading: slidesLoading }     = usePbData(getHeroSlides,      MOCK_HERO_SLIDES);
  const { data: featured,   loading: featuredLoading }   = usePbData(getFeaturedProducts, MOCK_PRODUCTS.filter(p => p.featured));
  const { data: categories, loading: categoriesLoading } = usePbData(getCategories,       MOCK_CATEGORIES);

  return (
    <>
      <Title>TRÄNCËNÐ — L'amour du dépassement</Title>

      {/* Hero shows mock slides immediately, replaces with PB data when loaded */}
      <HeroCarousel slides={slides()} />

      {/* Featured products carousel */}
      <section class="carousel-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">NOUVEAUTÉS</h2>
            <A href="/shop" class="section-link">Tout voir →</A>
          </div>
          <ProductCarousel products={featured()} loading={featuredLoading()} />
        </div>
      </section>

      {/* Marquee */}
      <div class="marquee-section">
        <div class="marquee-track">
          <For each={[...MARQUEE_ITEMS, ...MARQUEE_ITEMS]}>{item =>
            <span class="marquee-item">{item === "★" ? <span style="color:var(--accent)">★</span> : item}</span>
          }</For>
        </div>
      </div>

      {/* Categories */}
      <section class="categories-section">
        <div class="container">
          <div class="section-header"><h2 class="section-title">SHOP BY CATEGORY</h2></div>
          <Show
            when={!categoriesLoading()}
            fallback={<div class="categories-grid"><For each={[1,2,3,4]}>{() => <div class="skeleton" style="aspect-ratio:3/4" />}</For></div>}
          >
            <div class="categories-grid">
              <For each={categories()}>{cat => {
                const imgUrl = getCategoryImageUrl(cat);
                return (
                  <A href={`/shop?cat=${cat.slug}`} class="category-card">
                    <div class="category-card-bg" style={imgUrl ? `background-image:url(${imgUrl});background-size:cover;background-position:center` : ""}>
                      <Show when={!imgUrl}><div class="category-placeholder">⬡</div></Show>
                    </div>
                    <div class="category-card-overlay" />
                    <div class="category-card-content">
                      <div class="category-card-name">{cat.name}</div>
                      <Show when={cat.description}><div class="category-card-count">{cat.description}</div></Show>
                      <div class="category-card-count" style="margin-top:4px">EXPLORER →</div>
                    </div>
                  </A>
                );
              }}</For>
            </div>
          </Show>
        </div>
      </section>

      {/* Philosophy */}
      <section style="padding:80px 0;border-top:1px solid var(--gray-2);border-bottom:1px solid var(--gray-2);background:var(--gray-1)">
        <div class="container" style="text-align:center">
          <p style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:var(--accent);margin-bottom:16px">NOTRE PHILOSOPHIE</p>
          <h2 style="font-family:var(--font-display);font-size:clamp(48px,8vw,100px);letter-spacing:0.04em;line-height:1;color:var(--white);margin-bottom:24px">L'AMOUR DU<br />DÉPASSEMENT</h2>
          <p style="font-size:15px;color:var(--gray-4);max-width:560px;margin:0 auto 40px;line-height:1.8">Chaque pièce est conçue pour ceux qui cherchent à se surpasser. Qualité artisanale, design intemporel.</p>
          <A href="/about" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--accent);padding-bottom:4px">EN SAVOIR PLUS →</A>
        </div>
      </section>
    </>
  );
}
