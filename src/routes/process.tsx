import { Title } from "@solidjs/meta";
import { createSignal, For, Show } from "solid-js";

// ── Images par étape — remplace les FILE_ID et FILENAME par tes vraies valeurs PocketBase
// Format : https://api.keshau.com/api/files/{collectionId}/{recordId}/{filename}
// Tu peux stocker ces images dans une collection PocketBase "process_images" par exemple
const STEP_IMAGES: Record<string, string> = {
  "001": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_001/esquisse.jpg",
  "002": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_002/matiere.jpg",
  "003": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_003/coupe.jpg",
  "004": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_004/teinture.jpg",
  "005": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_005/couture.jpg",
  "006": "https://api.keshau.com/api/files/COLLECTION_ID/RECORD_ID_006/final.jpg",
};

const STEPS = [
  {
    num: "001", phase: "ESQUISSE", title: "Le dessin", accent: "#c0392b",
    desc: "Tout commence par une idée sur papier. Nos créateurs esquissent les silhouettes, les proportions, les volumes. Des dizaines de croquis pour une seule pièce — on cherche la forme juste, celle qui parle sans parler.",
    details: ["Recherche de références", "Croquis de silhouette", "Études de proportion", "Sélection du concept final"],
  },
  {
    num: "002", phase: "MATIÈRE", title: "Le tissu", accent: "#111110",
    desc: "On choisit nos matières avec soin — coton naturel, lin, jersey dense. Chaque tissu est testé pour sa tenue, sa respirabilité, son comportement à la décoloration naturelle.",
    details: ["Sélection des fibres", "Tests de résistance", "Choix du grammage", "Validation colorimétrique"],
  },
  {
    num: "003", phase: "PATRONNAGE", title: "La coupe", accent: "#c0392b",
    desc: "Le patron transforme le dessin en réalité technique. Chaque courbe, chaque pincement, chaque aisance est calculée. C'est là que la pièce prend sa structure invisible.",
    details: ["Tracé du patron base", "Équilibre et aisance", "Toile de calage", "Ajustements sur mannequin"],
  },
  {
    num: "004", phase: "TEINTURE", title: "La couleur", accent: "#c0392b",
    desc: "Nos pièces sont teintes à la main — techniques naturelles, bains de teinture, effets de dégradé. Chaque résultat est unique. Pas de deux pièces identiques.",
    details: ["Préparation des bains", "Immersion contrôlée", "Fixation naturelle", "Contrôle du rendu final"],
  },
  {
    num: "005", phase: "ASSEMBLAGE", title: "La couture", accent: "#111110",
    desc: "Piqûres renforcées, surjeteuses, points invisibles — chaque couture est pensée pour durer. On assemble à la main les parties les plus délicates. La technique sert la longévité.",
    details: ["Assemblage des pièces", "Coutures renforcées", "Finitions à la main", "Contrôle des tensions"],
  },
  {
    num: "006", phase: "CONTRÔLE", title: "Le produit final", accent: "#111110",
    desc: "Avant de quitter l'atelier, chaque pièce passe par un contrôle rigoureux. Coutures, tombé, dimensions, finitions. Ce qui n'est pas parfait ne sort pas.",
    details: ["Inspection visuelle", "Mesures de conformité", "Test de tombé", "Validation et étiquetage"],
  },
];

export default function Process() {
  const [active, setActive] = createSignal<number | null>(null);

  return (
    <>
      <Title>Process — TRÄNCËNÐ</Title>
      <div class="shop-page">

        {/* ── HEADER ── */}
        <div class="process-header">
          <div class="container">
            <div class="process-header-grid">
              <div>
                <p class="process-eyebrow">TRÄNCËNÐ — DOCUMENT DE PROCESSUS</p>
                <h1 class="process-hero-title">Du dessin<br />au vêtement.</h1>
                <p class="process-hero-desc">
                  Chaque pièce TRÄNCËNÐ est le résultat d'un processus rigoureux —
                  de l'esquisse initiale à la couture finale. Six étapes, zéro compromis.
                </p>
              </div>
              <div class="process-meta">
                <div class="process-meta-row">
                  <span class="process-meta-key">ORIGINE</span>
                  <span class="process-meta-val">POINTE-NOIRE, CONGO</span>
                </div>
                <div class="process-meta-row">
                  <span class="process-meta-key">PRODUCTION</span>
                  <span class="process-meta-val">100% ARTISANALE</span>
                </div>
                <div class="process-meta-row">
                  <span class="process-meta-key">ÉDITION</span>
                  <span class="process-meta-val">LIMITÉE — CHAQUE SAISON</span>
                </div>
                <div class="process-meta-row process-meta-row--last">
                  <span class="process-meta-key">ÉTAPES</span>
                  <span class="process-meta-val">006 / PROCESSUS COMPLET</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── STEPS ── */}
        <div class="container">
          <div class="process-steps">
            <For each={STEPS}>{(step, i) => (
              <div
                class={`process-step ${active() === i() ? "process-step--open" : ""}`}
                onClick={() => setActive(active() === i() ? null : i())}
              >
                <div class="process-step-row">
                  <div class="process-step-num" style={`color:${step.accent}`}>{step.num}</div>
                  <div class="process-step-body">
                    <div class="process-step-top">
                      <span class="process-step-phase">{step.phase}</span>
                      <span class={`process-step-toggle ${active() === i() ? "open" : ""}`}>+</span>
                    </div>
                    <h2 class="process-step-title">{step.title}</h2>
                  </div>
                </div>

                <Show when={active() === i()}>
                  <div class="process-step-content">
                    {/* Image */}
                    <div class="process-step-illus">
                      <img
                        src={STEP_IMAGES[step.num]}
                        alt={`${step.phase} — ${step.title}`}
                        class="process-step-img"
                        loading="lazy"
                      />
                    </div>
                    {/* Texte */}
                    <div class="process-step-detail">
                      <p class="process-step-desc">{step.desc}</p>
                      <div class="process-step-list">
                        <For each={step.details}>{(d) => (
                          <div class="process-step-list-item">
                            <span class="process-step-dot" style={`background:${step.accent}`} />
                            <span class="process-step-list-text">{d}</span>
                          </div>
                        )}</For>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>
            )}</For>
          </div>
        </div>

        {/* ── MANIFESTE ── */}
        <div class="process-manifeste">
          <div class="container">
            <div class="process-manifeste-grid">
              <div>
                <p class="process-manifeste-eyebrow">PHILOSOPHIE</p>
                <h2 class="process-manifeste-title">Fait pour durer,<br />pas pour plaire.</h2>
              </div>
              <div class="process-manifeste-body">
                <p class="process-manifeste-text">
                  On ne produit pas vite. On ne produit pas beaucoup. Chaque pièce
                  prend le temps qu'elle mérite. C'est pour ça qu'elle dure.
                </p>
                <p class="process-manifeste-text">
                  TRÄNCËNÐ, c'est l'amour du dépassement — de soi, de la matière,
                  des conventions. Le vêtement comme acte.
                </p>
                <a href="/shop" class="process-manifeste-cta">VOIR LA COLLECTION →</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
