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

export default function TermsOfService() {
  return (
    <>
      <Title>Terms of Service — TRÄNCËNÐ</Title>
      <PolicyLayout title="TERMS OF SERVICE" lastUpdated="1er janvier 2025">

        <Section title="ACCEPTANCE OF TERMS">
          <p>By accessing and using trancendstore.com, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>
        </Section>

        <Section title="USE OF THE SITE">
          <p>You agree to use this site only for lawful purposes and in a manner that does not infringe the rights of others. You may not:</p>
          <ul style="padding-left:20px;display:flex;flex-direction:column;gap:8px;margin-top:8px">
            <li>Use the site for fraudulent purposes</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Reproduce or distribute any content without our written consent</li>
            <li>Submit false or misleading information</li>
          </ul>
        </Section>

        <Section title="ACCOUNTS">
          <p>When creating an account, you are responsible for maintaining the confidentiality of your credentials. You agree to notify us immediately of any unauthorized use of your account. TRÄNCËNÐ reserves the right to terminate accounts at its discretion.</p>
        </Section>

        <Section title="PRODUCT DESCRIPTIONS">
          <p>We strive to display our products as accurately as possible. However, we cannot guarantee that your screen accurately reflects the actual color of products. Slight variations may occur, especially for UPCYCLING / HANDCRAFTED items which are unique by nature.</p>
        </Section>

        <Section title="LIMITATION OF LIABILITY">
          <p>TRÄNCËNÐ shall not be liable for any indirect, incidental, or consequential damages arising from the use of our site or products. Our liability is limited to the purchase price of the item in question.</p>
        </Section>

        <Section title="MODIFICATIONS">
          <p>TRÄNCËNÐ reserves the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the site. Your continued use of the site constitutes acceptance of the modified terms.</p>
        </Section>

        <Section title="GOVERNING LAW">
          <p>These Terms of Service are governed by the laws of the Republic of Congo. Any disputes shall be subject to the exclusive jurisdiction of the courts of Pointe-Noire.</p>
        </Section>

      </PolicyLayout>
    </>
  );
}
