import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { For, Show, createSignal, onMount, onCleanup } from "solid-js";
import ProductCard from "~/components/ProductCard";
import {
  getFeaturedProducts,
  getCategories,
  getHeroSlides,
  getCategoryImageUrl,
  getHeroSlideImageUrl,
  getAllImageUrls,
  getImageUrl,
  parseColors,
  MOCK_PRODUCTS,
  MOCK_CATEGORIES,
  MOCK_HERO_SLIDES,
  type HeroSlide,
  type Category,
  type Product,
} from "~/lib/pocketbase";
import { usePbData } from "~/lib/use-pb-resource";
import { addToCart } from "~/lib/cart";

const MARQUEE_ITEMS = [
  "LIVRAISON INTERNATIONALE",
  "—",
  "NOUVEAUX DROPS",
  "—",
  "HANDCRAFTED IN CONGO",
  "—",
  "L'AMOUR DU DÉPASSEMENT",
  "—",
  "FREE RETURNS",
  "—",
];

// ── HERO / LAB SPLASH ──────────────────────────────────────────
function LabHero(props: { slides: HeroSlide[] }) {
  const [current, setCurrent] = createSignal(0);
  const [prevIdx, setPrevIdx] = createSignal(-1);
  const [busy, setBusy] = createSignal(false);
  let timer: ReturnType<typeof setInterval>;

  const slides = () => (props.slides.length > 0 ? props.slides : MOCK_HERO_SLIDES);

  function goTo(i: number) {
    if (busy() || i === current()) return;
    setPrevIdx(current());
    setBusy(true);
    setCurrent(i);
    setTimeout(() => { setPrevIdx(-1); setBusy(false); }, 900);
  }
  const next = () => goTo((current() + 1) % slides().length);
  const prev = () => goTo((current() - 1 + slides().length) % slides().length);

  onMount(() => { timer = setInterval(next, 5000); });
  onCleanup(() => clearInterval(timer));
  const restart = () => { clearInterval(timer); timer = setInterval(next, 5000); };

  return (
    <section class="lab-hero">
      {/* Left vertical label */}
      <div class="lab-hero-side-label">
        <span>TRÄNCËNÐ</span>
        <span>LAB — 001</span>
      </div>

      {/* Main content grid */}
      <div class="lab-hero-grid">

        {/* Column 1: Title block */}
        <div class="lab-hero-title-col">
          <p class="lab-hero-eyebrow">GARMENTS AS EXPERIMENTS</p>
          <h1 class="lab-hero-title">TRÄNCËNÐ</h1>
          <div class="lab-hero-subtitle-lines">
            <span>RESEARCH — FORM / TEXTURE / IDENTITY</span>
            <span>LIMITED EDITIONS</span>
          </div>
          <A href="/shop" class="lab-hero-cta">
            EXPLORE COLLECTION &nbsp;→
          </A>
          <div class="lab-hero-scroll">
            SCROLL &nbsp;↓
          </div>
        </div>

        {/* Column 2: Central hero image */}
        <div class="lab-hero-image-col">
          <div class="lab-hero-image-frame">
            <For each={slides()}>
              {(slide, i) => {
                const url = getHeroSlideImageUrl(slide);
                return (
                  <div
                    class="lab-hero-slide"
                    style={{
                      opacity: i() === current() ? "1" : i() === prevIdx() ? "0" : "0",
                      "z-index": i() === current() ? "2" : i() === prevIdx() ? "1" : "0",
                      transition: "opacity 0.9s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    {url ? (
                      <img src={url} class="lab-hero-img" alt={slide.title || ""} loading={i() === 0 ? "eager" : "lazy"} />
                    ) : (
                      <div class="lab-hero-placeholder" />
                    )}
                  </div>
                );
              }}
            </For>
            {/* Frame label */}
            <div class="lab-hero-frame-label">
              <span>TRND / {new Date().getFullYear().toString().slice(2)}</span>
            </div>
            <div class="lab-hero-frame-label-bottom">
              LAB {new Date().getFullYear()}
            </div>
            {/* Barcode decoration */}
            <div class="lab-hero-barcode">
              <div class="lab-hero-barcode-inner" />
            </div>
            {/* Corner dots */}
            <div class="lab-hero-corner lab-hero-corner--tl" />
            <div class="lab-hero-corner lab-hero-corner--tr" />
          </div>
          {/* Slide counter */}
          <div class="lab-hero-counter">
            <button class="lab-hero-nav" onClick={() => { prev(); restart(); }}>←</button>
            <span class="lab-hero-count-text">
              {String(current() + 1).padStart(2, "0")} / {String(slides().length).padStart(2, "0")}
            </span>
            <button class="lab-hero-nav" onClick={() => { next(); restart(); }}>→</button>
          </div>
        </div>

        {/* Column 3: Product detail sidebar */}
        <div class="lab-hero-detail-col">
          <div class="lab-hero-detail-header">
            <span class="lab-hero-experiment">EXPERIMENT {String(current() + 1).padStart(2, "0")}</span>
            <span class="lab-hero-detail-dots">⋮</span>
          </div>
          <h2 class="lab-hero-detail-title">
            {slides()[current()]?.title || "STRUCTURED\nDRESS"}
          </h2>
          <p class="lab-hero-detail-meta">
            {slides()[current()]?.subtitle || "COTTON // HAND-DYED // LIMITED"}
          </p>
          <div class="lab-hero-detail-price-row">
            <span class="lab-hero-detail-price">
              {/* placeholder price */}
              €350
            </span>
            <A href={slides()[current()]?.cta_url || "/shop"} class="lab-hero-detail-cta">
              VIEW &nbsp;→
            </A>
          </div>
          {/* Dots nav */}
          <div class="lab-hero-dots">
            <For each={slides()}>
              {(_, i) => (
                <button
                  class={`lab-hero-dot ${current() === i() ? "active" : ""}`}
                  onClick={() => { goTo(i()); restart(); }}
                />
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div class="lab-hero-progress-track">
        <div
          class="lab-hero-progress-fill"
          style={{ width: `${((current() + 1) / slides().length) * 100}%` }}
        />
      </div>
    </section>
  );
}

// ── LAB GRID SECTION ──────────────────────────────────────────
// Replace with your actual YouTube video ID
const YOUTUBE_VIDEO_ID = "g-06sDLT8is"; // ← change this to your video ID

function LabGrid(props: { products: Product[]; loading: boolean }) {
  const list = () => props.products.slice(0, 5);

  // Selected product index — drives LAB NOTES + DETAILS reactively
  const [activeIdx, setActiveIdx] = createSignal(0);
  const selected = () => list()[activeIdx()] ?? null;

  // All image URLs of selected product — using the same helper as _id_.tsx
  const selectedImages = () => {
    const p = selected();
    if (!p) return [];
    return getAllImageUrls(p);
  };

  // Active thumb in detail panel
  const [activeThumb, setActiveThumb] = createSignal(0);

  // Reset thumb when product changes
  const handleSelect = (i: number) => {
    setActiveIdx(i);
    setActiveThumb(0);
  };

  return (
    <section class="lab-grid-section">
      <div class="lab-grid-container">

        {/* ── LEFT: Collection list ── */}
        <div class="lab-grid-left">
          <div class="lab-grid-section-label">COLLECTION</div>
          <div class="lab-collection-list">
            <Show
              when={!props.loading}
              fallback={
                <For each={[1, 2, 3, 4, 5]}>
                  {() => <div class="lab-collection-item skeleton" style="height:48px" />}
                </For>
              }
            >
              <For each={list()}>
                {(p, i) => (
                  <button
                    class={`lab-collection-item ${activeIdx() === i() ? "active" : ""}`}
                    onClick={() => handleSelect(i())}
                  >
                    <span class="lab-collection-num">{String(i() + 1).padStart(2, "0")}</span>
                    <span class="lab-collection-dash">—</span>
                    <span class="lab-collection-name">
                      {p.name?.toUpperCase() || `TRÄNCËNÐ ${["I","II","III","IV","V"][i()]}`}
                    </span>
                    {activeIdx() === i()
                      ? <span class="lab-collection-arrow">→</span>
                      : <span class="lab-collection-plus">+</span>
                    }
                  </button>
                )}
              </For>
            </Show>
          </div>
        </div>

        {/* ── CENTER: LAB NOTES — updates with selected product ── */}
        <div class="lab-grid-center">
          <div class="lab-panel-header">
            <div class="lab-panel-drag">⠿</div>
            <span class="lab-panel-title">LAB NOTES</span>
            <div class="lab-panel-indicators">
              <span class="lab-indicator lab-indicator--active" />
              <span class="lab-indicator" />
            </div>
          </div>

          <Show when={selected()}>
            {/* Product name + price header */}
            <div class="lab-notes-product-header">
              <span class="lab-notes-product-name">{selected()!.name?.toUpperCase()}</span>
              <span class="lab-notes-product-price">{selected()!.price?.toLocaleString("fr-FR")} €</span>
            </div>
          </Show>

          <div class="lab-notes-list">
            <div class="lab-note-row">
              <span class="lab-note-key">CATÉGORIE</span>
              <span class="lab-note-dash">—</span>
              <span class="lab-note-val">
                {selected()?.category?.toUpperCase() || "COLLECTION"}
              </span>
            </div>
            <div class="lab-note-row">
              <span class="lab-note-key">FABRIC</span>
              <span class="lab-note-dash">—</span>
              <span class="lab-note-val">NATURAL / RECLAIMED</span>
            </div>
            <div class="lab-note-row">
              <span class="lab-note-key">PROCESS</span>
              <span class="lab-note-dash">—</span>
              <span class="lab-note-val">HANDCRAFTED / STRUCTURE</span>
            </div>
            <div class="lab-note-row">
              <span class="lab-note-key">STOCK</span>
              <span class="lab-note-dash">—</span>
              <span class="lab-note-val"
                style={selected()?.in_stock ? "color:var(--ink)" : "color:#b03020"}>
                {selected()?.in_stock ? "EN STOCK" : "ÉPUISÉ"}
              </span>
            </div>
          </div>

          {/* Center image — first image of selected product */}
          <div class="lab-notes-image">
            <Show
              when={selectedImages().length > 0}
              fallback={
                <div class="lab-notes-img-placeholder">
                  <span class="lab-notes-stamp">TRÄNCËNÐ</span>
                </div>
              }
            >
              <img
                src={selectedImages()[0]}
                alt={selected()?.name || ""}
                class="lab-notes-img"
                style="transition:opacity 0.3s ease"
              />
            </Show>

            {/* Description overlay */}
            <Show when={selected()?.description}>
              <div class="lab-notes-desc-overlay">
                <p class="lab-notes-desc">{selected()!.description}</p>
              </div>
            </Show>
          </div>

          {/* CTA */}
          <Show when={selected()}>
            <A href={`/products/${selected()!.id}`} class="lab-notes-view-btn">
              VIEW PRODUCT →
            </A>
          </Show>
        </div>

        {/* ── CENTER-RIGHT: YouTube Process video ── */}
        <div class="lab-grid-process">
          <div class="lab-process-video-wrap">
            <iframe
              class="lab-process-iframe"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1`}
              title="TRÄNCËNÐ — PROCESS"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            <div class="lab-process-video-label">
              <span class="lab-process-video-tag">▶ PROCESS</span>
            </div>
          </div>
          <div class="lab-process-label">LAB</div>
        </div>

        {/* ── RIGHT: Details panel — images of selected product ── */}
        <div class="lab-grid-details">
          <div class="lab-panel-header">
            <span class="lab-panel-title">DETAILS</span>
            <Show when={selected()}>
              <span class="lab-detail-price">{selected()!.price?.toLocaleString("fr-FR")} €</span>
            </Show>
          </div>

          <div class="lab-detail-thumbs">
            <Show
              when={!props.loading}
              fallback={<For each={[1,2,3]}>{() => <div class="lab-detail-thumb skeleton" />}</For>}
            >
              <Show
                when={selectedImages().length > 0}
                fallback={
                  <For each={[1,2,3]}>
                    {() => <div class="lab-detail-thumb"><div class="lab-detail-thumb-inner" /></div>}
                  </For>
                }
              >
                <For each={selectedImages().slice(0, 4)}>
                  {(url, i) => (
                    <button
                      class={`lab-detail-thumb ${activeThumb() === i() ? "active" : ""}`}
                      onClick={() => setActiveThumb(i())}
                    >
                      <img src={url} alt="" class="lab-detail-thumb-img" loading="lazy" />
                    </button>
                  )}
                </For>
              </Show>
            </Show>
          </div>

          {/* Large preview of active thumb */}
          <Show when={selectedImages().length > 0}>
            <div class="lab-detail-preview">
              <img
                src={selectedImages()[activeThumb()]}
                alt={selected()?.name || ""}
                class="lab-detail-preview-img"
                style="transition:opacity 0.25s ease"
              />
              <A href={`/products/${selected()?.id}`} class="lab-detail-preview-cta">
                VOIR →
              </A>
            </div>
          </Show>
        </div>

      </div>
    </section>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────
export default function Home() {
  const { data: slides, loading: slidesLoading } = usePbData(getHeroSlides, MOCK_HERO_SLIDES);
  const { data: featured, loading: featuredLoading } = usePbData(
    getFeaturedProducts,
    MOCK_PRODUCTS.filter((p) => p.featured),
  );
  const { data: categories, loading: categoriesLoading } = usePbData(getCategories, MOCK_CATEGORIES);

  return (
    <>
      <Title>TRÄNCËNÐ — L'amour du dépassement</Title>

      {/* Lab hero splash */}
      <LabHero slides={slides()} />

      {/* Lab grid: collection + notes + details */}
      <LabGrid products={featured()} loading={featuredLoading()} />

      {/* Marquee */}
      <div class="lab-marquee">
        <div class="lab-marquee-track">
          <For each={[...MARQUEE_ITEMS, ...MARQUEE_ITEMS]}>
            {(item) => (
              <span class="lab-marquee-item">
                {item === "—" ? <span class="lab-marquee-sep">—</span> : item}
              </span>
            )}
          </For>
        </div>
      </div>

      {/* Featured products section */}
      <section class="lab-products-section">
        <div class="container">
          <div class="lab-section-header">
            <div class="lab-section-label">NOUVEAUTÉS</div>
            <A href="/shop" class="lab-section-link">VOIR TOUT →</A>
          </div>
          <Show
            when={!featuredLoading()}
            fallback={
              <div class="lab-products-grid">
                <For each={[1,2,3]}>{() => <div class="skeleton" style="aspect-ratio:3/4;width:100%" />}</For>
              </div>
            }
          >
            <div class="lab-products-grid">
              <For each={featured().slice(0,3)}>
                {(p) => (
                  <ProductCard
                    product={p}
                    onQuickAdd={(p) => {
                      const c = parseColors(p.colors)[0] ?? { name: "Défaut", hex: "#111" };
                      addToCart(p, c, p.sizes?.[0] || "UNIQUE");
                    }}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
      </section>

      {/* Categories */}
      <section class="lab-categories-section">
        <div class="container">
          <div class="lab-section-header">
            <div class="lab-section-label">CATEGORIES</div>
          </div>
          <Show
            when={!categoriesLoading()}
            fallback={
              <div class="categories-grid">
                <For each={[1,2,3,4]}>{() => <div class="skeleton" style="aspect-ratio:3/4" />}</For>
              </div>
            }
          >
            <div class="categories-grid">
              <For each={categories()}>
                {(cat) => {
                  const imgUrl = getCategoryImageUrl(cat);
                  return (
                    <A href={`/shop?cat=${cat.slug}`} class="category-card">
                      <div
                        class="category-card-bg"
                        style={imgUrl ? `background-image:url(${imgUrl});background-size:cover;background-position:center` : ""}
                      >
                        <Show when={!imgUrl}>
                          <div class="category-placeholder">⬡</div>
                        </Show>
                      </div>
                      <div class="category-card-overlay" />
                      <div class="category-card-content">
                        <div class="category-card-name">{cat.name}</div>
                        <Show when={cat.description}>
                          <div class="category-card-count">{cat.description}</div>
                        </Show>
                        <div class="category-card-count" style="margin-top:4px">EXPLORER →</div>
                      </div>
                    </A>
                  );
                }}
              </For>
            </div>
          </Show>
        </div>
      </section>

      {/* Brand statement */}
      <section class="lab-brand-section">
        <div class="container">
          <div class="lab-brand-grid">
            <div class="lab-brand-left">
              <p class="lab-brand-eyebrow">TRÄNCËNÐ MOVEMENT</p>
              <h2 class="lab-brand-title">MORE THAN<br />A BRAND</h2>
              <p class="lab-brand-desc">
                TRÄNCËNÐ est une marque née pour ceux qui refusent les limites.
                Chaque pièce représente l'ambition, la créativité et le dépassement.
                Nous créons des vêtements pour ceux qui veulent aller au-delà.
              </p>
              <A href="/about" class="lab-brand-cta">HISTOIRE & PHILOSOPHIE →</A>
            </div>
            <div class="lab-brand-right">
              <div class="lab-brand-stat-grid">
                <div class="lab-brand-stat">
                  <span class="lab-brand-stat-num">003</span>
                  <span class="lab-brand-stat-label">COLLECTIONS</span>
                </div>
                <div class="lab-brand-stat">
                  <span class="lab-brand-stat-num">100%</span>
                  <span class="lab-brand-stat-label">HANDCRAFTED</span>
                </div>
                <div class="lab-brand-stat">
                  <span class="lab-brand-stat-num">∞</span>
                  <span class="lab-brand-stat-label">DÉPASSEMENT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
