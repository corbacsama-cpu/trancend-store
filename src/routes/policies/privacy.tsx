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

export default function PrivacyPolicy() {
  return (
    <>
      <Title>Privacy Policy — TRÄNCËNÐ</Title>
      <PolicyLayout title="PRIVACY POLICY" lastUpdated="1er janvier 2025">

        <Section title="DONNÉES COLLECTÉES">
          <p>Lors de votre utilisation de notre site, nous collectons les informations suivantes :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li><strong style="color:var(--white)">Données de commande</strong> : nom, prénom, adresse de livraison, email, numéro de téléphone</li>
            <li><strong style="color:var(--white)">Données de paiement</strong> : traitées directement par nos prestataires sécurisés (Stripe, PayPal) — nous ne stockons pas vos données bancaires</li>
            <li><strong style="color:var(--white)">Données de navigation</strong> : cookies, adresse IP, pages visitées (via des outils d'analyse anonymisés)</li>
            <li><strong style="color:var(--white)">Newsletter</strong> : adresse email si vous vous y inscrivez volontairement</li>
          </ul>
        </Section>

        <Section title="UTILISATION DES DONNÉES">
          <p>Vos données sont utilisées uniquement pour :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Traiter et expédier vos commandes</li>
            <li>Vous envoyer des confirmations et mises à jour de commande</li>
            <li>Améliorer notre site et notre service</li>
            <li>Vous envoyer notre newsletter (avec votre consentement)</li>
          </ul>
          <p>Nous ne vendons jamais vos données à des tiers.</p>
        </Section>

        <Section title="COOKIES">
          <p>Notre site utilise des cookies essentiels au fonctionnement du site (panier, session) et des cookies d'analyse anonymisés pour comprendre l'utilisation du site. Vous pouvez désactiver les cookies dans les paramètres de votre navigateur, ce qui peut affecter certaines fonctionnalités.</p>
        </Section>

        <Section title="VOS DROITS">
          <p>Conformément à la réglementation applicable, vous disposez des droits suivants concernant vos données personnelles :</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Droit d'accès et de rectification</li>
            <li>Droit à l'effacement (« droit à l'oubli »)</li>
            <li>Droit d'opposition au traitement</li>
            <li>Droit à la portabilité de vos données</li>
          </ul>
          <p>Pour exercer ces droits, contactez-nous à <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a>.</p>
        </Section>

        <Section title="SÉCURITÉ">
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation. Les transactions de paiement sont chiffrées via SSL.</p>
        </Section>

        <Section title="CONSERVATION DES DONNÉES">
          <p>Vos données de commande sont conservées pendant <strong style="color:var(--white)">5 ans</strong> à des fins comptables et légales. Les données de newsletter sont conservées jusqu'à votre désinscription.</p>
        </Section>

        <Section title="CONTACT">
          <p>Pour toute question relative à notre politique de confidentialité : <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a></p>
        </Section>

      </PolicyLayout>
    </>
  );
}
