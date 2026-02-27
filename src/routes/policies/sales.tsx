import { Title } from "@solidjs/meta";
import PolicyLayout from "~/components/PolicyLayout";

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

export default function SalesPolicy() {
  return (
    <>
      <Title>Politique de ventes — TRÄNCËNÐ</Title>
      <PolicyLayout title="CONDITIONS GÉNÉRALES DE VENTE" lastUpdated="1er janvier 2025">

        <Section title="OBJET">
          <p>Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre TRÄNCËNÐ et tout client effectuant un achat sur le site trancendstore.com.</p>
        </Section>

        <Section title="COMMANDES">
          <p>Toute commande passée sur notre site vaut acceptation des présentes CGV. TRÄNCËNÐ se réserve le droit de refuser ou d'annuler toute commande en cas de litige existant avec le client ou de suspicion de fraude.</p>
          <p>Une confirmation de commande vous sera envoyée par email dès validation de votre paiement.</p>
        </Section>

        <Section title="PRIX">
          <p>Les prix affichés sont en <strong style="color:var(--white)">euros (€)</strong>, toutes taxes comprises (TTC). TRÄNCËNÐ se réserve le droit de modifier ses prix à tout moment, étant entendu que les articles seront facturés au prix en vigueur au moment de la validation de la commande.</p>
          <p>Les frais de livraison sont indiqués séparément lors du processus de commande et sont à la charge du client.</p>
        </Section>

        <Section title="PAIEMENT">
          <p>Le paiement s'effectue en ligne par carte bancaire (Visa, Mastercard), PayPal, Apple Pay ou Shop Pay. Le paiement est sécurisé et les données bancaires ne sont pas stockées sur nos serveurs.</p>
          <p>La commande ne sera traitée qu'après confirmation du paiement par notre prestataire bancaire.</p>
        </Section>

        <Section title="DISPONIBILITÉ">
          <p>Nos offres de produits sont valables dans la limite des stocks disponibles. En cas d'indisponibilité d'un article après passation de votre commande, nous vous en informerons par email et procéderons au remboursement intégral dans les meilleurs délais.</p>
        </Section>

        <Section title="DROIT DE RÉTRACTATION">
          <p>Conformément aux dispositions légales applicables, vous disposez d'un délai de <strong style="color:var(--white)">14 jours</strong> à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.</p>
          <p>Ce droit ne s'applique pas aux articles personnalisés, aux pièces UPCYCLING uniques ni aux articles d'hygiène.</p>
        </Section>

        <Section title="JURIDICTION">
          <p>Les présentes CGV sont soumises au droit congolais. Tout litige sera soumis aux tribunaux compétents de Pointe-Noire, République du Congo.</p>
        </Section>

      </PolicyLayout>
    </>
  );
}
