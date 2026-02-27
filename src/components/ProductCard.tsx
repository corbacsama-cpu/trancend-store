import { A } from "@solidjs/router";
import { Show } from "solid-js";
import type { Product } from "~/lib/pocketbase";
import { getImageUrl } from "~/lib/pocketbase";

interface Props {
  product: Product;
  onQuickAdd?: (product: Product) => void;
}

export default function ProductCard({ product, onQuickAdd }: Props) {
  return (
    <A href={`/products/${product.id}`} class="product-card">
      <div class="product-card-img">
        <Show
          when={product.images?.length > 0}
          fallback={
            <div class="product-placeholder">
              ⬡
            </div>
          }
        >
          <img src={getImageUrl(product)} alt={product.name} loading="lazy" />
        </Show>

        <Show when={product.featured}>
          <span class="product-tag">NEW</span>
        </Show>

        <div
          class="product-card-quick"
          onClick={(e) => {
            e.preventDefault();
            onQuickAdd?.(product);
          }}
        >
          AJOUTER AU PANIER →
        </div>
      </div>

      <div class="product-card-info">
        <span class="product-card-name">{product.name}</span>
        <span class="product-card-price">{product.price.toLocaleString("fr-FR")} €</span>
      </div>
    </A>
  );
}
