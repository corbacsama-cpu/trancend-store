import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { For, Show, createEffect } from "solid-js";
import ProductCard from "~/components/ProductCard";
import { getProducts, getCategories, parseColors, MOCK_PRODUCTS, MOCK_CATEGORIES } from "~/lib/pocketbase";
import { usePbData, usePbDataKeyed } from "~/lib/use-pb-resource";
import { addToCart } from "~/lib/cart";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const activeCategory = () => params.cat || "";

  const { data: products,   loading: productsLoading }   = usePbDataKeyed(activeCategory, (cat) => getProducts(cat || undefined), MOCK_PRODUCTS);
  const { data: categories, loading: categoriesLoading } = usePbData(getCategories, MOCK_CATEGORIES);

  const allCategories = () => [
    { label: "TOUS", slug: "" },
    ...(categories()).map(c => ({ label: c.name, slug: c.slug })),
  ];

  return (
    <>
      <Title>Shop — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header">
            <h1 class="page-title">SHOP</h1>
            <p class="page-subtitle">{activeCategory() ? activeCategory().toUpperCase() : "TOUTE LA COLLECTION"}</p>
          </div>

          {/* Category filters */}
          <Show
            when={!categoriesLoading()}
            fallback={<div class="filter-bar"><div class="filter-btn active">TOUS</div></div>}
          >
            <div class="filter-bar">
              <For each={allCategories()}>{cat =>
                <button
                  class={`filter-btn ${activeCategory() === cat.slug ? "active" : ""}`}
                  onClick={() => setParams({ cat: cat.slug || undefined })}
                >
                  {cat.label}
                </button>
              }</For>
            </div>
          </Show>

          {/* Products grid */}
          <Show
            when={!productsLoading()}
            fallback={
              <div class="loading-grid">
                <For each={[1,2,3,4,5,6]}>{() => <div class="skeleton skeleton-card" />}</For>
              </div>
            }
          >
            <Show
              when={products().length > 0}
              fallback={
                <div style="text-align:center;padding:80px 0;font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4)">
                  <div style="font-family:var(--font-display);font-size:60px;color:var(--gray-2);margin-bottom:16px">⬡</div>
                  Aucun produit dans cette catégorie
                </div>
              }
            >
              <div class="products-grid">
                <For each={products()}>{product =>
                  <ProductCard
                    product={product}
                    onQuickAdd={p => {
                      const c = parseColors(p.colors)[0] ?? { name:"Défaut", hex:"#0a0a0a" };
                      addToCart(p, c, p.sizes?.[0] || "UNIQUE");
                    }}
                  />
                }</For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
}
