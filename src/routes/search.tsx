import { Title } from "@solidjs/meta";
import { useSearchParams } from "@solidjs/router";
import { createSignal, createEffect, For, Show } from "solid-js";
import ProductCard from "~/components/ProductCard";
import { searchProducts, parseColors } from "~/lib/pocketbase";
import { addToCart } from "~/lib/cart";

export default function Search() {
  const [params, setParams]   = useSearchParams();
  const [input,  setInput]    = createSignal(params.q || "");
  const [results, setResults] = createSignal<any[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [done,    setDone]    = createSignal(false);

  createEffect(async () => {
    const q = params.q || "";
    if (!q.trim()) { setResults([]); setDone(false); return; }
    setLoading(true); setDone(false);
    try {
      setResults(await searchProducts(q));
    } finally {
      setLoading(false); setDone(true);
    }
  });

  function submit(e: Event) {
    e.preventDefault();
    const q = input().trim();
    if (q) setParams({ q });
  }

  return (
    <>
      <Title>Recherche — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header"><h1 class="page-title">RECHERCHE</h1></div>

          <form onSubmit={submit} style="display:flex;margin-bottom:48px;max-width:600px">
            <input
              type="text" value={input()} onInput={e => setInput(e.currentTarget.value)}
              placeholder="Rechercher un produit, une couleur, une catégorie..."
              style="flex:1;background:var(--gray-1);border:1px solid var(--gray-2);border-right:none;padding:16px 20px;color:var(--white);font-size:14px;font-family:var(--font-body);outline:none"
              autofocus
            />
            <button type="submit" style="padding:16px 24px;background:var(--white);color:var(--black);font-family:var(--font-mono);font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;cursor:pointer;border:none">
              {loading() ? "..." : "CHERCHER →"}
            </button>
          </form>

          <Show when={loading()}>
            <div style="display:flex;align-items:center;gap:12px;font-family:var(--font-mono);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--gray-4);margin-bottom:32px">
              <span class="search-spinner" /> RECHERCHE EN COURS...
            </div>
          </Show>

          <Show when={done() && !loading()}>
            <p style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4);margin-bottom:32px">
              <span style="color:var(--accent)">{results().length}</span> résultat{results().length !== 1 ? "s" : ""} pour «&nbsp;<span style="color:var(--white)">{params.q}</span>&nbsp;»
            </p>
          </Show>

          <Show when={done() && !loading() && results().length === 0}>
            <div style="text-align:center;padding:80px 0">
              <div style="font-family:var(--font-display);font-size:64px;color:var(--gray-2);margin-bottom:16px">⬡</div>
              <p style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4)">Aucun résultat pour «&nbsp;{params.q}&nbsp;»</p>
            </div>
          </Show>

          <Show when={results().length > 0 && !loading()}>
            <div class="products-grid">
              <For each={results()}>{p =>
                <ProductCard product={p} onQuickAdd={p => {
                  const c = parseColors(p.colors)[0] ?? { name:"Défaut", hex:"#0a0a0a" };
                  addToCart(p, c, p.sizes?.[0] || "UNIQUE");
                }} />
              }</For>
            </div>
          </Show>

          <Show when={!params.q && !loading()}>
            <div style="text-align:center;padding:80px 0;font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4)">
              Entrez un terme pour rechercher dans notre collection
            </div>
          </Show>
        </div>
      </div>
    </>
  );
}
