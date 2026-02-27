import { Title } from "@solidjs/meta";
import PolicyLayout from "~/components/PolicyLayout";

export default function MentionLegale() {
  return (
    <>
      <Title>Mention légale — TRÄNCËNÐ</Title>
      <PolicyLayout title="MENTION LÉGALE" lastUpdated="1er janvier 2025">
        <Section title="ÉDITEUR DU SITE">
          <p>Le site <strong style="color:var(--white)">trancendstore.com</strong> est édité par la société TRÄNCËNÐ.</p>
          <p>Siège social : Pointe-Noire, République du Congo</p>
          <p>Email : <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a></p>
        </Section>

        <Section title="HÉBERGEMENT">
          <p>Le site est hébergé par un prestataire tiers. Pour toute question relative à l'hébergement, contactez-nous à l'adresse email ci-dessus.</p>
        </Section>

        <Section title="PROPRIÉTÉ INTELLECTUELLE">
          <p>L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes) est la propriété exclusive de TRÄNCËNÐ et est protégé par les lois en vigueur sur la propriété intellectuelle.</p>
          <p>Toute reproduction, représentation, modification ou adaptation, totale ou partielle, est strictement interdite sans l'accord préalable et écrit de TRÄNCËNÐ.</p>
        </Section>

        <Section title="RESPONSABILITÉ">
          <p>TRÄNCËNÐ s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, nous ne pouvons garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition.</p>
        </Section>

        <Section title="DROIT APPLICABLE">
          <p>Les présentes mentions légales sont soumises au droit congolais. En cas de litige, les tribunaux compétents sont ceux du ressort de Pointe-Noire, République du Congo.</p>
        </Section>
      </PolicyLayout>
    </>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div style="margin-bottom:40px">
      <h2 style="font-family:var(--font-display);font-size:24px;letter-spacing:0.08em;color:var(--white);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--gray-2)">
        {title}
      </h2>
      <div style="display:flex;flex-direction:column;gap:12px">{children}</div>
    </div>
  );
}
