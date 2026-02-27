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
              <A href="/shop" style="display:inline-flex;align-items:center;gap:12px;background:var(--accent);color:var(--black);font-family:var(--font-mono);font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:16px 32px;margin-top:16px;transition:background 0.25s">
                EXPLORER LA COLLECTION →
              </A>
            </div>
          </div>

          {/* Values */}
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">
            {[
              { icon: "◈", title: "QUALITÉ ABSOLUE", desc: "Matières sélectionnées, coupes rigoureuses, finitions irréprochables sur chaque pièce." },
              { icon: "✦", title: "FAIT AVEC INTENTION", desc: "Chaque collection raconte une histoire. Chaque pièce est conçue pour avoir un sens." },
              { icon: "⬡", title: "UPCYCLING & ART", desc: "Notre ligne handcrafted transforme des matériaux existants en œuvres uniques." },
            ].map((v) => (
              <div style="background:var(--gray-1);padding:48px 32px;text-align:center">
                <div style="font-size:40px;margin-bottom:20px;color:var(--accent)">{v.icon}</div>
                <h3 style="font-family:var(--font-display);font-size:22px;letter-spacing:0.08em;margin-bottom:12px">{v.title}</h3>
                <p style="font-size:13px;color:var(--gray-4);line-height:1.7">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
