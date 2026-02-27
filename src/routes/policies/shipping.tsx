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

export default function ShippingPolicy() {
  return (
    <>
      <Title>Shipping Policy — TRÄNCËNÐ</Title>
      <PolicyLayout title="SHIPPING POLICY" lastUpdated="1er janvier 2025">

        <Section title="TRAITEMENT DE LA COMMANDE">
          <p>Les commandes sont traitées sous <strong style="color:var(--white)">2 à 5 jours ouvrés</strong> après confirmation du paiement. Vous recevrez un email de confirmation avec un numéro de suivi dès l'expédition.</p>
          <p>Les commandes passées le week-end ou les jours fériés seront traitées le prochain jour ouvré.</p>
        </Section>

        <Section title="DÉLAIS ET TARIFS DE LIVRAISON">
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:13px">
              <thead>
                <tr style="border-bottom:1px solid var(--gray-2)">
                  {["DESTINATION", "DÉLAI ESTIMÉ", "TARIF"].map(h => (
                    <th style="text-align:left;padding:12px 16px;font-family:var(--font-mono);font-size:10px;letter-spacing:0.15em;color:var(--gray-4)">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Congo (local)", "3 – 7 jours ouvrés", "Gratuit dès 50 €"],
                  ["Afrique subsaharienne", "7 – 14 jours ouvrés", "15 – 25 €"],
                  ["Europe", "10 – 20 jours ouvrés", "20 – 35 €"],
                  ["Amérique du Nord", "14 – 25 jours ouvrés", "25 – 45 €"],
                  ["Reste du monde", "14 – 30 jours ouvrés", "Sur devis"],
                ].map(([dest, delai, tarif]) => (
                  <tr style="border-bottom:1px solid rgba(255,255,255,0.04)">
                    <td style="padding:14px 16px;color:var(--white)">{dest}</td>
                    <td style="padding:14px 16px;color:var(--gray-4)">{delai}</td>
                    <td style="padding:14px 16px;color:var(--accent);font-family:var(--font-mono);font-size:12px">{tarif}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style="font-size:13px">Ces délais sont des estimations et peuvent varier selon les conditions douanières et la disponibilité des transporteurs.</p>
        </Section>

        <Section title="SUIVI DE COMMANDE">
          <p>Un numéro de suivi vous sera communiqué par email dès l'expédition de votre colis. Vous pourrez suivre votre commande directement sur le site du transporteur.</p>
        </Section>

        <Section title="DOUANES ET TAXES">
          <p>Pour les livraisons internationales, des frais de douane et taxes locales peuvent s'appliquer selon votre pays de résidence. Ces frais sont à la charge du destinataire et sont indépendants de TRÄNCËNÐ.</p>
          <p>Nous vous recommandons de vous renseigner auprès des autorités douanières de votre pays avant de passer commande.</p>
        </Section>

        <Section title="COLIS PERDUS OU ENDOMMAGÉS">
          <p>En cas de colis perdu ou endommagé lors du transport, contactez-nous à <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a> dans les <strong style="color:var(--white)">7 jours</strong> suivant la date de livraison estimée. Nous ferons le nécessaire pour résoudre la situation dans les meilleurs délais.</p>
        </Section>

      </PolicyLayout>
    </>
  );
}
