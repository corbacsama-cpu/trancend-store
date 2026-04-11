import { Title } from "@solidjs/meta";
import { createSignal, For, Show } from "solid-js";

// ── Illustrations SVG par étape ──────────────────────────────────
const ILLUSTRATIONS = {
  "001": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Feuille de papier -->
    <rect x="40" y="24" width="160" height="152" rx="2" fill="#fff" stroke="#ccc9c2" stroke-width="1"/>
    <rect x="52" y="36" width="136" height="140" rx="1" fill="#faf8f5"/>
    <!-- Croquis silhouette robe -->
    <path d="M 110 55 C 105 58 100 65 98 75 L 88 140 L 132 140 L 122 75 C 120 65 115 58 110 55Z" stroke="#111110" stroke-width="1.2" fill="none" stroke-linejoin="round"/>
    <!-- Épaules -->
    <path d="M 98 75 C 90 70 82 72 80 78 L 88 140" stroke="#111110" stroke-width="1.2" fill="none"/>
    <path d="M 122 75 C 130 70 138 72 140 78 L 132 140" stroke="#111110" stroke-width="1.2" fill="none"/>
    <!-- Lignes de croquis secondaires (versions alternatives) -->
    <path d="M 165 48 C 162 51 158 57 157 64 L 150 115 L 175 115 L 168 64 C 167 57 163 51 160 48Z" stroke="#c0392b" stroke-width="0.6" fill="none" opacity="0.5"/>
    <!-- Règle -->
    <rect x="44" y="152" width="80" height="10" rx="1" fill="#e8e4dc" stroke="#ccc9c2" stroke-width="0.8"/>
    <line x1="54" y1="152" x2="54" y2="162" stroke="#888580" stroke-width="0.5"/>
    <line x1="64" y1="152" x2="64" y2="158" stroke="#888580" stroke-width="0.5"/>
    <line x1="74" y1="152" x2="74" y2="162" stroke="#888580" stroke-width="0.5"/>
    <line x1="84" y1="152" x2="84" y2="158" stroke="#888580" stroke-width="0.5"/>
    <line x1="94" y1="152" x2="94" y2="162" stroke="#888580" stroke-width="0.5"/>
    <line x1="104" y1="152" x2="104" y2="158" stroke="#888580" stroke-width="0.5"/>
    <line x1="114" y1="152" x2="114" y2="162" stroke="#888580" stroke-width="0.5"/>
    <!-- Crayon -->
    <rect x="195" y="40" width="6" height="50" rx="1" fill="#f0b429" transform="rotate(30 198 65)"/>
    <polygon points="198,90 194,100 202,90" fill="#c87f1a" transform="rotate(30 198 65) translate(-2,0)"/>
    <!-- Lignes de croquis annotation -->
    <line x1="148" y1="75" x2="163" y2="75" stroke="#c0392b" stroke-width="0.6" stroke-dasharray="2,2"/>
    <line x1="148" y1="95" x2="163" y2="95" stroke="#c0392b" stroke-width="0.6" stroke-dasharray="2,2"/>
    <text x="166" y="78" font-family="Courier New, monospace" font-size="6" fill="#c0392b" opacity="0.7">col</text>
    <text x="166" y="98" font-family="Courier New, monospace" font-size="6" fill="#c0392b" opacity="0.7">taille</text>
  </svg>`,

  "002": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Rouleau de tissu principal -->
    <ellipse cx="90" cy="100" rx="22" ry="62" fill="#d8d0c4" stroke="#b0ada6" stroke-width="1"/>
    <ellipse cx="90" cy="100" rx="14" ry="54" fill="#e8e4dc" stroke="#ccc9c2" stroke-width="0.8"/>
    <!-- Tissu déroulé -->
    <path d="M 90 145 Q 140 155 220 148 L 220 165 Q 140 172 90 162Z" fill="#d8d0c4" stroke="#b0ada6" stroke-width="0.8"/>
    <!-- Texture tissu (fils) -->
    <line x1="110" y1="148" x2="110" y2="165" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <line x1="130" y1="149" x2="130" y2="166" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <line x1="150" y1="150" x2="150" y2="167" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <line x1="170" y1="150" x2="170" y2="167" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <line x1="190" y1="149" x2="190" y2="166" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <line x1="210" y1="148" x2="210" y2="165" stroke="#b0ada6" stroke-width="0.5" opacity="0.5"/>
    <!-- Deuxième rouleau -->
    <ellipse cx="155" cy="72" rx="16" ry="44" fill="#c0392b" stroke="#8e2318" stroke-width="1" opacity="0.7"/>
    <ellipse cx="155" cy="72" rx="10" ry="38" fill="#d45a4a" stroke="#c0392b" stroke-width="0.8" opacity="0.7"/>
    <!-- Troisième rouleau -->
    <ellipse cx="210" cy="82" rx="14" ry="38" fill="#111110" stroke="#333" stroke-width="1" opacity="0.8"/>
    <ellipse cx="210" cy="82" rx="8" ry="32" fill="#2a2a28" stroke="#111" stroke-width="0.8" opacity="0.8"/>
    <!-- Étiquette tissu -->
    <rect x="108" y="28" width="52" height="28" rx="2" fill="#fff" stroke="#ccc9c2" stroke-width="0.8"/>
    <text x="134" y="40" font-family="Courier New, monospace" font-size="6" fill="#888580" text-anchor="middle">100% COTON</text>
    <text x="134" y="50" font-family="Courier New, monospace" font-size="6" fill="#888580" text-anchor="middle">240 g/m²</text>
    <!-- Fil reliant étiquette -->
    <line x1="134" y1="56" x2="134" y2="68" stroke="#888580" stroke-width="0.5" stroke-dasharray="2,2"/>
  </svg>`,

  "003": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Grand patron dépliable -->
    <path d="M 30 20 L 250 20 L 250 175 L 30 175Z" fill="#fff" stroke="#ccc9c2" stroke-width="0.8"/>
    <!-- Patron devant -->
    <path d="M 55 35 C 55 35 70 30 100 35 C 110 38 115 45 115 55 L 118 160 L 52 160 L 55 55 C 55 45 50 38 55 35Z" stroke="#111110" stroke-width="1.2" fill="#f5f1eb" stroke-linejoin="round"/>
    <!-- Patron dos -->
    <path d="M 145 35 C 145 35 160 30 190 35 C 200 38 205 45 205 55 L 208 160 L 142 160 L 145 55 C 145 45 140 38 145 35Z" stroke="#111110" stroke-width="1.2" fill="#f5f1eb" stroke-linejoin="round"/>
    <!-- Marges de couture (tirets) -->
    <path d="M 60 38 C 60 38 73 33 100 38 C 109 41 113 47 113 56 L 116 157 L 55 157 L 58 56" stroke="#c0392b" stroke-width="0.6" fill="none" stroke-dasharray="3,2"/>
    <path d="M 150 38 C 150 38 163 33 190 38 C 199 41 203 47 203 56 L 206 157 L 145 157 L 148 56" stroke="#c0392b" stroke-width="0.6" fill="none" stroke-dasharray="3,2"/>
    <!-- Crans d'assemblage -->
    <rect x="83" y="33" width="3" height="8" fill="#c0392b"/>
    <rect x="173" y="33" width="3" height="8" fill="#c0392b"/>
    <!-- Flèche droit fil -->
    <line x1="84" y1="90" x2="84" y2="130" stroke="#111110" stroke-width="0.8"/>
    <polygon points="84,86 81,93 87,93" fill="#111110"/>
    <polygon points="84,134 81,127 87,127" fill="#111110"/>
    <!-- Labels -->
    <text x="84" y="115" font-family="Courier New, monospace" font-size="7" fill="#888580" text-anchor="middle">DEVANT</text>
    <text x="84" y="124" font-family="Courier New, monospace" font-size="5" fill="#888580" text-anchor="middle">x1</text>
    <text x="174" y="115" font-family="Courier New, monospace" font-size="7" fill="#888580" text-anchor="middle">DOS</text>
    <text x="174" y="124" font-family="Courier New, monospace" font-size="5" fill="#888580" text-anchor="middle">x1</text>
    <!-- Légende marges -->
    <line x1="218" y1="165" x2="232" y2="165" stroke="#c0392b" stroke-width="0.6" stroke-dasharray="3,2"/>
    <text x="234" y="168" font-family="Courier New, monospace" font-size="5" fill="#c0392b">1.5cm</text>
  </svg>`,

  "004": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Grand bac de teinture -->
    <rect x="30" y="90" width="220" height="90" rx="4" fill="#111110" stroke="#333" stroke-width="1"/>
    <rect x="36" y="96" width="208" height="78" rx="3" fill="#1a1a18"/>
    <!-- Liquide de teinture (surface) -->
    <path d="M 36 118 Q 80 114 140 118 Q 200 122 244 118 L 244 174 L 36 174Z" fill="#2d2d2b"/>
    <!-- Vague surface -->
    <path d="M 36 118 Q 80 114 140 118 Q 200 122 244 118" stroke="#444440" stroke-width="1" fill="none"/>
    <!-- Tissu en train de tremper -->
    <path d="M 100 50 C 100 50 90 60 88 80 C 86 100 90 120 92 135 C 94 148 100 155 110 155 C 120 155 126 148 128 135 C 130 120 134 100 132 80 C 130 60 120 50 110 50Z" fill="#1a0a08" stroke="#c0392b" stroke-width="0.8" opacity="0.9"/>
    <!-- Partie encore hors teinture -->
    <path d="M 100 50 C 100 50 90 60 88 80 L 132 80 C 130 60 120 50 110 50Z" fill="#d8d0c4" stroke="#b0ada6" stroke-width="0.8"/>
    <!-- Fil de suspension -->
    <line x1="110" y1="20" x2="110" y2="50" stroke="#888580" stroke-width="1"/>
    <line x1="90" y1="20" x2="130" y2="20" stroke="#888580" stroke-width="1.5"/>
    <!-- Crochet -->
    <path d="M 110 20 Q 110 16 114 14 Q 118 12 118 16" stroke="#888580" stroke-width="1" fill="none" stroke-linecap="round"/>
    <!-- Bulles de teinture -->
    <circle cx="70" cy="130" r="3" fill="none" stroke="#333" stroke-width="0.6"/>
    <circle cx="160" cy="145" r="2" fill="none" stroke="#333" stroke-width="0.6"/>
    <circle cx="195" cy="128" r="4" fill="none" stroke="#333" stroke-width="0.6"/>
    <circle cx="55" cy="152" r="2" fill="none" stroke="#333" stroke-width="0.6"/>
    <!-- Dégradé effet -->
    <path d="M 88 80 C 86 100 90 120 92 135 L 128 135 C 130 120 134 100 132 80Z" fill="#2d1208" opacity="0.6"/>
    <!-- Thermomètre -->
    <rect x="228" y="100" width="6" height="50" rx="3" fill="#fff" stroke="#ccc9c2" stroke-width="0.8"/>
    <rect x="230" y="125" width="2" height="23" rx="1" fill="#c0392b"/>
    <circle cx="231" cy="150" r="4" fill="#c0392b"/>
    <text x="238" y="128" font-family="Courier New, monospace" font-size="6" fill="#888580">40°</text>
  </svg>`,

  "005": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Machine à coudre simplifiée -->
    <!-- Corps machine -->
    <rect x="80" y="60" width="130" height="80" rx="6" fill="#e8e4dc" stroke="#ccc9c2" stroke-width="1"/>
    <rect x="88" y="68" width="114" height="64" rx="4" fill="#f0ede8"/>
    <!-- Bras machine -->
    <rect x="120" y="40" width="90" height="30" rx="4" fill="#ddd9d2" stroke="#ccc9c2" stroke-width="0.8"/>
    <!-- Aiguille -->
    <line x1="138" y1="70" x2="138" y2="110" stroke="#555" stroke-width="1.5"/>
    <polygon points="138,114 136,108 140,108" fill="#555"/>
    <!-- Trou aiguille -->
    <ellipse cx="138" cy="112" rx="2" ry="1" fill="#888580"/>
    <!-- Pied presseur -->
    <rect x="130" y="104" width="16" height="6" rx="1" fill="#888580"/>
    <!-- Tissu sous la machine -->
    <path d="M 30 120 L 80 120 L 80 140 L 30 140Z" fill="#111110" stroke="#333" stroke-width="0.8"/>
    <path d="M 80 120 L 195 120 L 195 140 L 80 140Z" fill="#111110" stroke="#333" stroke-width="0.8"/>
    <path d="M 195 120 L 250 120 L 250 140 L 195 140Z" fill="#d8d0c4" stroke="#b0ada6" stroke-width="0.8"/>
    <!-- Couture (fil) -->
    <path d="M 30 130 Q 60 128 80 130 Q 110 132 138 130 Q 166 128 195 130" stroke="#c0392b" stroke-width="1" fill="none" stroke-dasharray="4,2"/>
    <!-- Bobine de fil -->
    <ellipse cx="185" cy="52" rx="12" ry="8" fill="#c0392b" stroke="#8e2318" stroke-width="0.8"/>
    <ellipse cx="185" cy="52" rx="6" ry="4" fill="#f0ede8"/>
    <line x1="185" y1="60" x2="185" y2="44" stroke="#c0392b" stroke-width="0.5"/>
    <!-- Fil allant vers l'aiguille -->
    <path d="M 185 60 Q 175 62 160 65 Q 148 67 138 70" stroke="#c0392b" stroke-width="0.5" fill="none"/>
    <!-- Détail bouton -->
    <circle cx="230" cy="85" r="8" fill="#ccc9c2" stroke="#b0ada6" stroke-width="0.8"/>
    <circle cx="230" cy="85" r="4" fill="#e8e4dc"/>
    <!-- Points de couture au bas -->
    <text x="30" y="158" font-family="Courier New, monospace" font-size="7" fill="#888580">— — — — — couture surjetée — — — —</text>
  </svg>`,

  "006": `<svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;display:block">
    <rect width="280" height="200" fill="#f5f1eb"/>
    <!-- Cintre -->
    <path d="M 140 25 Q 140 18 146 14 Q 152 10 152 16 Q 152 20 148 22" stroke="#888580" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M 140 25 Q 100 30 60 55 L 220 55 Q 180 30 140 25Z" stroke="#888580" stroke-width="1.2" fill="#e8e4dc"/>
    <!-- Vêtement fini sur cintre -->
    <path d="M 60 55 C 50 60 42 70 42 82 L 48 165 L 232 165 L 238 82 C 238 70 230 60 220 55Z" fill="#111110" stroke="#333" stroke-width="1"/>
    <!-- Coutures visibles (détail finition) -->
    <path d="M 140 55 L 140 165" stroke="#1a1a18" stroke-width="0.5" stroke-dasharray="3,3"/>
    <!-- Ourlet bas -->
    <line x1="52" y1="158" x2="228" y2="158" stroke="#2a2a28" stroke-width="2"/>
    <!-- Étiquette TRÄNCËNÐ -->
    <rect x="118" y="62" width="44" height="18" rx="1" fill="#f0ede8" stroke="#ccc9c2" stroke-width="0.6"/>
    <text x="140" y="73" font-family="Courier New, monospace" font-size="5" fill="#111110" text-anchor="middle" font-weight="bold">TRÄNCËNÐ</text>
    <text x="140" y="79" font-family="Courier New, monospace" font-size="4" fill="#888580" text-anchor="middle">HANDCRAFTED</text>
    <!-- Checklist inspection à droite -->
    <rect x="200" y="80" width="60" height="70" rx="2" fill="#fff" stroke="#ccc9c2" stroke-width="0.6"/>
    <text x="230" y="92" font-family="Courier New, monospace" font-size="5" fill="#888580" text-anchor="middle">CONTRÔLE</text>
    <line x1="206" y1="96" x2="254" y2="96" stroke="#ccc9c2" stroke-width="0.4"/>
    <!-- Items checklist -->
    <text x="210" y="108" font-family="Courier New, monospace" font-size="5" fill="#2d6a3f">✓ coutures</text>
    <text x="210" y="120" font-family="Courier New, monospace" font-size="5" fill="#2d6a3f">✓ tombé</text>
    <text x="210" y="132" font-family="Courier New, monospace" font-size="5" fill="#2d6a3f">✓ mesures</text>
    <text x="210" y="144" font-family="Courier New, monospace" font-size="5" fill="#2d6a3f">✓ étiquette</text>
    <!-- Badge validé -->
    <circle cx="230" cy="138" r="0" fill="none"/>
    <rect x="206" y="150" width="48" height="10" rx="2" fill="#2d6a3f"/>
    <text x="230" y="158" font-family="Courier New, monospace" font-size="5" fill="#fff" text-anchor="middle">VALIDÉ — REF 001</text>
  </svg>`,
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
                {/* Ligne fermée */}
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

                {/* Contenu déplié */}
                <Show when={active() === i()}>
                  <div class="process-step-content">
                    {/* Illustration */}
                    <div
                      class="process-step-illus"
                      innerHTML={ILLUSTRATIONS[step.num as keyof typeof ILLUSTRATIONS]}
                    />
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
