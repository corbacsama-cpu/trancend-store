import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createResource, For, Show, onMount } from "solid-js";
import { currentUser, logout, getUserOrders, pb } from "~/lib/pocketbase";

function StatusBadge(props: { status: string }) {
  const colors: Record<string, string> = {
    pending: "#c8a96e",
    confirmed: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#22c55e",
    cancelled: "#ef4444",
  };
  const labels: Record<string, string> = {
    pending: "EN ATTENTE",
    confirmed: "CONFIRMÉE",
    shipped: "EXPÉDIÉE",
    delivered: "LIVRÉE",
    cancelled: "ANNULÉE",
  };
  return (
    <span style={`background:${colors[props.status] || "#555"};color:#000;font-family:var(--font-mono);font-size:9px;font-weight:700;letter-spacing:0.15em;padding:4px 8px`}>
      {labels[props.status] || props.status.toUpperCase()}
    </span>
  );
}

export default function Account() {
  const navigate = useNavigate();
  const [orders] = createResource(getUserOrders);

  onMount(() => {
    if (!currentUser()) navigate("/auth/login");
  });

  function handleLogout() {
    logout();
    navigate("/");
  }

  const user = () => currentUser();

  return (
    <>
      <Title>Mon compte — TRÄNCËNÐ</Title>
      <div class="shop-page">
        <div class="container">
          <div class="shop-header" style="display:flex;align-items:flex-end;justify-content:space-between">
            <div>
              <h1 class="page-title">MON COMPTE</h1>
              <Show when={user()}>
                <p class="page-subtitle">{(user() as any)?.name || (user() as any)?.email}</p>
              </Show>
            </div>
            <button onClick={handleLogout}
              style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--gray-4);border:1px solid var(--gray-2);padding:10px 20px;transition:all 0.2s;cursor:pointer;background:none"
              onMouseEnter={(e) => { e.currentTarget.style.borderColor="var(--white)"; e.currentTarget.style.color="var(--white)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor="var(--gray-2)"; e.currentTarget.style.color="var(--gray-4)"; }}>
              DÉCONNEXION
            </button>
          </div>

          {/* Account info */}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px;margin-bottom:60px">
            <div style="background:var(--gray-1);padding:32px">
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:16px">INFORMATIONS</div>
              <div style="display:flex;flex-direction:column;gap:10px">
                <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:12px">
                  <span style="color:var(--gray-4)">NOM</span>
                  <span style="color:var(--white)">{(user() as any)?.name || "—"}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:12px">
                  <span style="color:var(--gray-4)">EMAIL</span>
                  <span style="color:var(--white)">{(user() as any)?.email}</span>
                </div>
                <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:12px">
                  <span style="color:var(--gray-4)">MEMBRE DEPUIS</span>
                  <span style="color:var(--white)">
                    {new Date((user() as any)?.created || "").toLocaleDateString("fr-FR", { month:"long", year:"numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <div style="background:var(--gray-1);padding:32px">
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:var(--accent);margin-bottom:16px">LIENS RAPIDES</div>
              <div style="display:flex;flex-direction:column;gap:12px">
                <A href="/shop" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4);transition:color 0.2s" onMouseEnter={(e) => e.currentTarget.style.color="var(--white)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--gray-4)"}>→ BOUTIQUE</A>
                <A href="/contact" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4);transition:color 0.2s" onMouseEnter={(e) => e.currentTarget.style.color="var(--white)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--gray-4)"}>→ CONTACT SAV</A>
                <A href="/policies/refund" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4);transition:color 0.2s" onMouseEnter={(e) => e.currentTarget.style.color="var(--white)"} onMouseLeave={(e) => e.currentTarget.style.color="var(--gray-4)"}>→ POLITIQUE DE RETOUR</A>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div>
            <div class="section-header">
              <h2 class="section-title">MES COMMANDES</h2>
            </div>

            <Show
              when={!orders.loading}
              fallback={<div style="font-family:var(--font-mono);font-size:12px;color:var(--gray-4);letter-spacing:0.12em">Chargement...</div>}
            >
              <Show
                when={(orders() || []).length > 0}
                fallback={
                  <div style="text-align:center;padding:60px 0">
                    <div style="font-family:var(--font-display);font-size:60px;color:var(--gray-2);margin-bottom:16px">⬡</div>
                    <p style="font-family:var(--font-mono);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray-4);margin-bottom:24px">Aucune commande pour l'instant</p>
                    <A href="/shop" style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent);border-bottom:1px solid var(--accent);padding-bottom:2px">
                      DÉCOUVRIR LA BOUTIQUE →
                    </A>
                  </div>
                }
              >
                <div style="display:flex;flex-direction:column;gap:2px">
                  <For each={orders()}>
                    {(order) => {
                      const items = typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];
                      return (
                        <div style="background:var(--gray-1);padding:24px 28px">
                          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">
                            <div>
                              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:var(--gray-4);margin-bottom:4px">
                                COMMANDE #{order.id.slice(-8).toUpperCase()}
                              </div>
                              <div style="font-family:var(--font-mono);font-size:11px;color:var(--gray-3)">
                                {new Date(order.created).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}
                              </div>
                            </div>
                            <div style="display:flex;align-items:center;gap:16px">
                              <StatusBadge status={order.status} />
                              <span style="font-family:var(--font-mono);font-size:14px;color:var(--accent)">{order.total?.toLocaleString("fr-FR")} €</span>
                            </div>
                          </div>
                          <div style="display:flex;flex-direction:column;gap:8px;padding-top:16px;border-top:1px solid var(--gray-2)">
                            <For each={items}>
                              {(item: any) => (
                                <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:11px;color:var(--gray-4)">
                                  <span style="color:var(--white)">{item.product?.name} <span style="color:var(--gray-4)">× {item.quantity}</span></span>
                                  <span>Taille: {item.size}</span>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
}
