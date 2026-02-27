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

export default function RefundPolicy() {
  return (
    <>
      <Title>Politique de remboursement — TRÄNCËNÐ</Title>
      <PolicyLayout title="POLITIQUE DE REMBOURSEMENT" lastUpdated="1er janvier 2025">

        <Section title="CONDITIONS DE RETOUR">
          <p>Vous disposez de <strong style="color:var(--white)">14 jours</strong> à compter de la réception de votre commande pour nous retourner un article.</p>
          <p>Pour être éligible au retour, l'article doit être :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Non porté, non lavé et non altéré</li>
            <li>Dans son emballage d'origine avec toutes les étiquettes</li>
            <li>Accompagné du bon de commande original</li>
          </ul>
        </Section>

        <Section title="ARTICLES NON REMBOURSABLES">
          <p>Les articles suivants ne peuvent pas être retournés :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Articles de la collection <strong style="color:var(--white)">UPCYCLING / HANDCRAFTED</strong> (pièces uniques)</li>
            <li>Articles soldés ou achetés en promotion</li>
            <li>Articles personnalisés sur commande</li>
            <li>Accessoires (pour des raisons d'hygiène)</li>
          </ul>
        </Section>

        <Section title="PROCÉDURE DE RETOUR">
          <p>Pour initier un retour, contactez-nous à <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a> avec :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Votre numéro de commande</li>
            <li>Le(s) article(s) à retourner</li>
            <li>La raison du retour</li>
          </ul>
          <p>Nous vous communiquerons l'adresse de retour. Les frais de retour sont à la charge du client sauf en cas d'article défectueux ou d'erreur de notre part.</p>
        </Section>

        <Section title="REMBOURSEMENT">
          <p>Une fois votre retour reçu et inspecté, nous vous notifierons par email. Si le retour est approuvé, le remboursement sera effectué sur votre moyen de paiement original dans un délai de <strong style="color:var(--white)">5 à 10 jours ouvrés</strong>.</p>
          <p>Les frais de livraison initiaux ne sont pas remboursés, sauf en cas d'article défectueux.</p>
        </Section>

        <Section title="ÉCHANGE">
          <p>Nous proposons des échanges de taille sous réserve de disponibilité. Contactez-nous avant d'effectuer votre retour pour vérifier la disponibilité de la taille souhaitée.</p>
        </Section>

      </PolicyLayout>
    </>
  );
}
