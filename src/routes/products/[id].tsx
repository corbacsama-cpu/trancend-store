import { Title } from "@solidjs/meta";
import { useParams, A } from "@solidjs/router";
import { createSignal, For, Show, createMemo, onCleanup, onMount } from "solid-js";
import { getProduct, getAllImageUrls, parseColors, type Color } from "~/lib/pocketbase";
import { usePbDataKeyed } from "~/lib/use-pb-resource";
import { addToCart } from "~/lib/cart";

export default function ProductPage() {
  const params = useParams();

  const { data: product, loading } = usePbDataKeyed(
    () => params.id,
    (id) => getProduct(id),
    null
  );

  const [selectedColor, setSelectedColor] = createSignal<Color | null>(null);
  const [selectedSize,  setSelectedSize]  = createSignal("");
  const [activeImg,     setActiveImg]     = createSignal(0);
  const [added,         setAdded]         = createSignal(false);
  const [zoomed,        setZoomed]        = createSignal(false);
  const [imgLoaded,     setImgLoaded]     = createSignal(false);

  const imageUrls = createMemo(() => { const p = product(); return p ? getAllImageUrls(p) : []; });
  const colors    = createMemo(() => { const p = product(); return p ? parseColors(p.colors) : []; });
  const imgCount  = () => imageUrls().length;

  const canAdd = () => {
    const p = product();
    if (!p || !selectedColor()) return false;
    return (p.sizes?.length ?? 0) === 0 || selectedSize() !== "";
  };

  function prevImg() { setActiveImg(i => (i - 1 + imgCount()) % imgCount()); setImgLoaded(false); }
  function nextImg() { setActiveImg(i => (i + 1) % imgCount()); setImgLoaded(false); }

  function onKey(e: KeyboardEvent) {
    if (!zoomed()) return;
    if (e.key === "ArrowLeft")  prevImg();
    if (e.key === "ArrowRight") nextImg();
    if (e.key === "Escape")     setZoomed(false);
  }
  onMount(() => window.addEventListener("keydown", onKey));
  onCleanup(() => window.removeEventListener("keydown", onKey));

  function handleAdd() {
    const p = product();
    if (!p || !canAdd() || !selectedColor()) return;
    addToCart(p, selectedColor()!, selectedSize() || "UNIQUE");
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  return (
    <>
      {/* Loading skeleton */}
      <Show when={loading()}>
        <div class="product-page">
          <div class="container">
            <div class="product-layout" style="margin-top:40px">
              <div class="skeleton" style="aspect-ratio:3/4;width:100%" />
              <div style="display:flex;flex-direction:column;gap:16px;padding-top:8px">
                <div class="skeleton" style="height:16px;width:40%" />
                <div class="skeleton" style="height:40px;width:80%" />
                <div class="skeleton" style="height:28px;width:30%" />
                <div class="skeleton" style="height:60px;width:100%" />
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Not found */}
      <Show when={!loading() && !product()}>
        <div style="padding:140px 0;text-align:center;font-family:var(--font-mono);font-size:11px;letter-spacing:0.2em;color:var(--gray-4)">
          PRODUIT INTROUVABLE
        </div>
      </Show>

      {/* Product */}
      <Show when={!loading() && product()}>
        {(() => {
          const p = product()!;
          return (
            <>
              <Title>{p.name} — TRÄNCËNÐ</Title>

              {/* Lightbox */}
              <Show when={zoomed() && imgCount() > 0}>
                <div class="lightbox-overlay" onClick={() => setZoomed(false)}>
                  <button class="lightbox-close" onClick={() => setZoomed(false)}>✕</button>
                  <Show when={imgCount() > 1}>
                    <button class="lightbox-arrow lightbox-prev" onClick={e => { e.stopPropagation(); prevImg(); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button class="lightbox-arrow lightbox-next" onClick={e => { e.stopPropagation(); nextImg(); }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </Show>
                  <img src={imageUrls()[activeImg()]} alt={p.name} class="lightbox-img" onClick={e => e.stopPropagation()} />
                  <Show when={imgCount() > 1}>
                    <div class="lightbox-counter">{activeImg()+1} / {imgCount()}</div>
                  </Show>
                </div>
              </Show>

              <div class="product-page">
                <div class="container">
                  <div class="breadcrumb">
                    <A href="/">HOME</A><span>/</span>
                    <A href="/shop">SHOP</A><span>/</span>
                    <A href={`/shop?cat=${p.category}`} style="text-transform:uppercase">{p.category}</A>
                    <span>/</span><span style="color:var(--white)">{p.name}</span>
                  </div>

                  <div class="product-layout">

                    {/* Gallery */}
                    <div class="product-gallery">
                      <div class="product-main-img">
                        <Show when={imgCount() > 0} fallback={<div class="product-img-placeholder">⬡</div>}>
                          <Show when={!imgLoaded()}><div class="product-img-skeleton" /></Show>
                          <img
                            src={imageUrls()[activeImg()]}
                            alt={`${p.name} — ${activeImg()+1}`}
                            class="product-main-img-el"
                            style={`opacity:${imgLoaded() ? 1 : 0};transition:opacity 0.3s;cursor:zoom-in`}
                            onLoad={() => setImgLoaded(true)}
                            onClick={() => setZoomed(true)}
                          />
                          <div class="gallery-zoom-hint">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>
                            AGRANDIR
                          </div>
                          <Show when={imgCount() > 1}>
                            <button class="gallery-arrow gallery-arrow-prev" onClick={prevImg}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 18l-6-6 6-6"/></svg></button>
                            <button class="gallery-arrow gallery-arrow-next" onClick={nextImg}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18l6-6-6-6"/></svg></button>
                            <div class="gallery-counter">{activeImg()+1} / {imgCount()}</div>
                          </Show>
                        </Show>
                      </div>
                      <Show when={imgCount() > 1}>
                        <div class="product-thumbnails">
                          <For each={imageUrls()}>{(url, i) =>
                            <button class={`product-thumb ${activeImg()===i() ? "active" : ""}`} onClick={() => { setActiveImg(i()); setImgLoaded(false); }}>
                              <img src={url} alt="" loading="lazy" />
                            </button>
                          }</For>
                        </div>
                      </Show>
                    </div>

                    {/* Info */}
                    <div class="product-info">
                      <p class="product-category">{p.category}</p>
                      <h1 class="product-name">{p.name}</h1>
                      <div class="product-price-display">{p.price.toLocaleString("fr-FR")} €</div>
                      <p class="product-description">{p.description}</p>

                      {/* Color picker — PRIMARY */}
                      <Show when={colors().length > 0}>
                        <div class="picker-block picker-block--primary">
                          <div class="picker-label">
                            COULEUR
                            <Show when={selectedColor()}>
                              <span class="picker-label-value">— {selectedColor()!.name}</span>
                            </Show>
                          </div>
                          <div class="color-swatches">
                            <For each={colors()}>{color =>
                              <button
                                class={`color-swatch ${selectedColor()?.name === color.name ? "selected" : ""}`}
                                style={{ "--swatch-color": color.hex } as any}
                                onClick={() => setSelectedColor(color)}
                                title={color.name}
                              >
                                <Show when={selectedColor()?.name === color.name}>
                                  <svg class="swatch-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
                                </Show>
                              </button>
                            }</For>
                          </div>
                          <Show when={!selectedColor()}>
                            <p class="picker-nudge">← Choisissez une couleur pour continuer</p>
                          </Show>
                        </div>
                      </Show>

                      {/* Size picker — SECONDARY */}
                      <Show when={(p.sizes?.length ?? 0) > 0}>
                        <div class={`picker-block ${colors().length > 0 ? "picker-block--secondary" : "picker-block--primary"}`}>
                          <div class="picker-label">
                            TAILLE
                            <Show when={selectedSize()}>
                              <span class="picker-label-value">— {selectedSize()}</span>
                            </Show>
                          </div>
                          <div class="sizes-grid">
                            <For each={p.sizes}>{size =>
                              <button class={`size-btn ${selectedSize()===size ? "selected" : ""}`} onClick={() => setSelectedSize(size)}>{size}</button>
                            }</For>
                          </div>
                        </div>
                      </Show>

                      {/* Add to cart */}
                      <button class="add-to-cart-btn" disabled={!canAdd()} onClick={handleAdd}>
                        <Show when={added()}>✓ AJOUTÉ AU PANIER</Show>
                        <Show when={!added() && canAdd()}>AJOUTER AU PANIER</Show>
                        <Show when={!added() && !canAdd() && !selectedColor() && colors().length > 0}>CHOISIR UNE COULEUR</Show>
                        <Show when={!added() && !canAdd() && selectedColor() && !selectedSize() && (p.sizes?.length ?? 0) > 0}>CHOISIR UNE TAILLE</Show>
                      </button>

                      {/* Details */}
                      <div class="product-details-table">
                        <div class="product-details-title">DÉTAILS DU PRODUIT</div>
                        <div class="product-details-row">
                          <span>CATÉGORIE</span><span style="color:var(--white);text-transform:uppercase">{p.category}</span>
                        </div>
                        <Show when={selectedColor()}>
                          <div class="product-details-row">
                            <span>COULEUR</span>
                            <span style="display:flex;align-items:center;gap:8px;color:var(--white)">
                              <span style={`width:12px;height:12px;border-radius:50%;background:${selectedColor()!.hex};border:1px solid rgba(255,255,255,0.2);display:inline-block`} />
                              {selectedColor()!.name}
                            </span>
                          </div>
                        </Show>
                        <div class="product-details-row">
                          <span>DISPONIBILITÉ</span>
                          <span style={`color:${p.in_stock ? "var(--accent)" : "var(--red)"}`}>{p.in_stock ? "EN STOCK" : "ÉPUISÉ"}</span>
                        </div>
                        <div class="product-details-row"><span>LIVRAISON</span><span style="color:var(--white)">INTERNATIONALE</span></div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </Show>
    </>
  );
}
