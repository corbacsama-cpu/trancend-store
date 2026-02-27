import { Title } from "@solidjs/meta";
import PolicyLayout from "~/components/PolicyLayout";

export default function ContactInfo() {
  return (
    <>
      <Title>Contact Information — TRÄNCËNÐ</Title>
      <PolicyLayout title="CONTACT INFORMATION">
        <div style="display:grid;gap:32px">

          {[
            {
              label: "MARQUE",
              value: "TRÄNCËNÐ",
            },
            {
              label: "EMAIL GÉNÉRAL",
              value: <a href="mailto:contact@trancendstore.com" style="color:var(--accent)">contact@trancendstore.com</a>,
            },
            {
              label: "EMAIL SAV / COMMANDES",
              value: <a href="mailto:orders@trancendstore.com" style="color:var(--accent)">orders@trancendstore.com</a>,
            },
            {
              label: "LOCALISATION",
              value: "Pointe-Noire, République du Congo",
            },
            {
              label: "INSTAGRAM",
              value: <a href="https://instagram.com/trancend.cg" target="_blank" style="color:var(--accent)">@trancend.cg</a>,
            },
            {
              label: "FACEBOOK",
              value: <a href="https://facebook.com/trancend.cg" target="_blank" style="color:var(--accent)">facebook.com/trancend.cg</a>,
            },
            {
              label: "YOUTUBE",
              value: <a href="https://youtube.com/channel/UCiZDPUhY-meRFPCSIRCOkaw" target="_blank" style="color:var(--accent)">TRÄNCËNÐ sur YouTube</a>,
            },
            {
              label: "HORAIRES DE RÉPONSE",
              value: "Lundi – Vendredi, 9h – 18h (heure de Pointe-Noire)",
            },
            {
              label: "DÉLAI DE RÉPONSE",
              value: "Sous 48h ouvrées",
            },
          ].map((item) => (
            <div style="display:flex;gap:32px;padding-bottom:24px;border-bottom:1px solid var(--gray-2)">
              <div style="font-family:var(--font-mono);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:var(--gray-3);min-width:200px;padding-top:2px">
                {item.label}
              </div>
              <div style="color:var(--white);font-size:15px">{item.value}</div>
            </div>
          ))}

        </div>
      </PolicyLayout>
    </>
  );
}
