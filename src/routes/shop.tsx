import { Title } from "@solidjs/meta";
import { A, useSearchParams } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getProducts, getCategories, getImageUrl, parseColors, MOCK_PRODUCTS, MOCK_CATEGORIES } from "~/lib/pocketbase";
import { usePbData, usePbDataKeyed } from "~/lib/use-pb-resource";
import { addToCart } from "~/lib/cart";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const activeCategory = () => params.cat || "";

  const { data: products, loading: productsLoading } = usePbDataKeyed(
    activeCategory,
    (cat) => getProducts(cat || undefined),
    MOCK_PRODUCTS
  );
  const { data: categories, loading: categoriesLoading } = usePbData(getCategories, MOCK_CATEGORIES);

  const allCategories = () => [
    { label: "LAB", slug: "" },
    ...(categories()).map(c => ({ label: c.name.toUpperCase(), slug: c.slug })),
    { label: "PROCESS", slug: "process" },
    { label: "STUDIO", slug: "studio" },
    { label: "RESEARCH", slug: "research" },
  ];

  return (
    <>
      <Title>Garments — TRÄNCËNÐ LAB</Title>

      <div class="lab-shop-page">

       

        <div class="lab-shop-inner">

          {/* ── MASTHEAD ── */}
          <div class="lab-shop-masthead">
            <h1 class="lab-shop-title">TRÄNCËNÐ</h1>
            <p class="lab-shop-sub1">Experimental Garment Studio</p>
            <p class="lab-shop-sub2">Researching form, history, and identity.</p>
          </div>

          {/* ── NAV TABS ── */}
          <div class="lab-shop-nav">
            <Show
              when={!categoriesLoading()}
              fallback={
                <For each={["LAB", "GARMENTS", "PROCESS", "STUDIO", "RESEARCH"]}>
                  {(label) => <span class="lab-shop-nav-item">{label}</span>}
                </For>
              }
            >
              <For each={allCategories()}>{(cat, i) => (
                <>
                  {i() > 0 && <span class="lab-shop-nav-sep">|</span>}
                  <button
                    class={`lab-shop-nav-item ${activeCategory() === cat.slug ? "active" : ""}`}
                    onClick={() => setParams({ cat: cat.slug || undefined })}
                  >
                    {cat.label}
                  </button>
                </>
              )}</For>
            </Show>
          </div>

          {/* ── EXPERIMENT CARDS GRID ── */}
          <Show
            when={!productsLoading()}
            fallback={
              <div class="lab-experiment-grid">
                <For each={[1, 2, 3]}>{(_, i) => (
                  <div class="lab-experiment-card">
                    <div class="lab-experiment-num skeleton" style="height:20px;width:140px;margin-bottom:12px" />
                    <div class="lab-experiment-img-wrap skeleton" />
                    <div class="lab-experiment-body">
                      <div class="skeleton" style="height:14px;width:70%;margin-bottom:8px" />
                      <div class="skeleton" style="height:14px;width:50%" />
                    </div>
                  </div>
                )}</For>
              </div>
            }
          >
            <Show
              when={products().length > 0}
              fallback={
                <div class="lab-empty">
                  <p>NO SPECIMENS FOUND IN THIS CATEGORY</p>
                </div>
              }
            >
              <div class="lab-experiment-grid">
                <For each={products()}>{(product, i) => {
                  const imgUrl = getImageUrl(product);
                  return (
                    <div class="lab-experiment-card">
                      {/* Card header */}
                      <div class="lab-experiment-header">
                        <span class="lab-experiment-num">
                          EXPERIMENT {String(i() + 1).padStart(3, "0")}
                        </span>
                      </div>

                      {/* Image */}
                      <A href={`/products/${product.id}`} class="lab-experiment-img-wrap">
                        <Show
                          when={imgUrl}
                          fallback={
                            <div class="lab-experiment-img-placeholder">⬡</div>
                          }
                        >
                          <img
                            src={imgUrl}
                            alt={product.name}
                            class="lab-experiment-img"
                            loading="lazy"
                          />
                        </Show>
                        {/* Quick add overlay */}
                        <div
                          class="lab-experiment-overlay"
                          onClick={(e) => {
                            e.preventDefault();
                            const c = parseColors(product.colors)[0] ?? { name: "Défaut", hex: "#111" };
                            addToCart(product, c, product.sizes?.[0] || "UNIQUE");
                          }}
                        >
                          + ADD TO BAG
                        </div>
                      </A>

                      {/* Specimen data */}
                      <div class="lab-experiment-body">
                        <div class="lab-experiment-row">
                          <span class="lab-experiment-field">Specimen:</span>
                          <span class="lab-experiment-val">{product.name}</span>
                        </div>
                        <Show when={product.category}>
                          <div class="lab-experiment-row">
                            <span class="lab-experiment-field">Material:</span>
                            <span class="lab-experiment-val">{product.category}</span>
                          </div>
                        </Show>
                        <div class="lab-experiment-row">
                          <span class="lab-experiment-field">Edition:</span>
                          <span class="lab-experiment-val">
                            {product.featured ? "Limited" : "Collection"}
                          </span>
                        </div>
                        <div class="lab-experiment-price-row">
                          <span class="lab-experiment-price">
                            {product.price.toLocaleString("fr-FR")} €
                          </span>
                          <A href={`/products/${product.id}`} class="lab-experiment-view">
                            VIEW →
                          </A>
                        </div>
                      </div>
                    </div>
                  );
                }}</For>
              </div>

            </Show>
          </Show>

         

        </div>
      </div>
    </>
  );
}
