import type { JSX } from "solid-js";

interface Props {
  title: string;
  lastUpdated?: string;
  children: JSX.Element;
}

export default function PolicyLayout({ title, lastUpdated, children }: Props) {
  return (
    <div class="shop-page">
      <div class="container">
        <div class="shop-header">
          <h1 class="page-title" style="font-size:clamp(36px,6vw,80px)">{title}</h1>
          {lastUpdated && (
            <p class="page-subtitle">Mis à jour le {lastUpdated}</p>
          )}
        </div>
        <div style="max-width:760px;line-height:1.9;color:var(--gray-4);font-size:15px">
          {children}
        </div>
      </div>
    </div>
  );
}
