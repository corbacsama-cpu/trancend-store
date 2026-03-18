import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";

export default function About() {
  return (
    <>
      <Title>À propos — TRÄNCËNÐ</Title>
      <div class="about-page">
        <div class="container">
          <div class="about-hero">
            <div class="about-big-text">
              L'AMOUR<br />DU DÉ<em>PAS</em><br />SEMENT
            </div>
            <div class="about-text">
              <h2>NOTRE HISTOIRE</h2>
              <p>
                TRÄNCËNÐ est née d'une conviction simple : le style ne devrait pas être une limite.
                Fondée au Congo, notre marque puise dans l'énergie brute et authentique de ceux
                qui cherchent toujours à se dépasser.
              </p>
              <p>
                Chaque pièce est pensée pour durer — matières premium, coupes soignées,
                finitions artisanales. Nous livrons dans le monde entier parce que le dépassement
                n'a pas de frontières.
              </p>
              <p>
                De la ligne UPCYCLING aux collections saisonnières, TRÄNCËNÐ incarne
                une mode responsable qui refuse le compromis entre éthique et esthétique.
              </p>
              <A href="/shop" style="display:inline-flex;align-items:center;gap:12px;background:var(--ink);color:var(--bg);font-family:var(--font-mono);font-size:10px;letter-spacing:0.18em;text-transform:uppercase;padding:16px 28px;margin-top:8px;transition:opacity 0.2s;width:fit-content">
                EXPLORER LA COLLECTION →
              </A>
            </div>
          </div>

          {/* Values */}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);margin-top:2px">
            {[
              { icon: "◈", title: "QUALITÉ ABSOLUE", desc: "Matières sélectionnées, coupes rigoureuses, finitions irréprochables sur chaque pièce." },
              { icon: "✦", title: "FAIT AVEC INTENTION", desc: "Chaque collection raconte une histoire. Chaque pièce est conçue pour avoir un sens." },
              { icon: "⬡", title: "UPCYCLING & ART", desc: "Notre ligne handcrafted transforme des matériaux existants en œuvres uniques." },
            ].map((v) => (
              <div style="background:var(--bg);padding:48px 36px;text-align:center">
                <div style="font-size:32px;margin-bottom:20px;color:var(--ink-3)">{v.icon}</div>
                <h3 style="font-family:var(--font-display);font-size:22px;letter-spacing:0.08em;margin-bottom:12px;color:var(--ink)">{v.title}</h3>
                <p style="font-size:13px;color:var(--ink-3);line-height:1.8">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
