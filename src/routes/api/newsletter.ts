/**
 * src/routes/api/newsletter.ts
 * Route POST /api/newsletter
 * Enregistre l'email + envoie un email de bienvenue via Brevo
 */
import { json } from "@solidjs/router";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";

// ── Ajouter le contact à la liste Brevo ───────────────────────────
async function addToBrevoList(email: string) {
  // Crée ou met à jour le contact dans Brevo
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
    body: JSON.stringify({
      email,
      listIds: [2], // ID de ta liste newsletter dans Brevo — change si besoin
      updateEnabled: true,
    }),
  });

  // 201 = créé, 204 = mis à jour — les deux sont OK
  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    // Si déjà inscrit (409) on ignore
    if (res.status !== 409) {
      console.error("[brevo] addContact error:", res.status, err);
      throw new Error("Erreur inscription liste");
    }
  }
  console.log("[brevo] Contact added/updated:", email);
}

// ── Envoyer l'email de bienvenue ──────────────────────────────────
async function sendWelcomeEmail(email: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: STORE_NAME, email: STORE_EMAIL },
      to: [{ email }],
      subject: "TRÄNCËNÐ — Bienvenue dans le LAB",
      htmlContent: buildWelcomeEmail({ email }),
    }),
  });
  if (!res.ok) {
    console.error("[brevo] welcome email error:", res.status, await res.text());
  } else {
    console.log("[brevo] Welcome email sent to:", email);
  }
}

// ── Handler ───────────────────────────────────────────────────────
export async function POST({ request }: { request: Request }) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return json({ error: "Content-Type application/json requis" }, { status: 415 });
  }

  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: "Corps invalide" }, { status: 400 }); }

  const email = body?.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    await addToBrevoList(email);
    await sendWelcomeEmail(email);
    return json({ success: true });
  } catch (err: any) {
    console.error("[newsletter] Error:", err);
    return json({ error: "Erreur lors de l'inscription" }, { status: 500 });
  }
}

// ── Template email de bienvenue ───────────────────────────────────

function buildWelcomeEmail(opts: { email: string }) {
  return `
<!DOCTYPE html><html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">

        <tr><td style="background:#111110;padding:28px 36px">
          <p style="margin:0;font-family:Georgia,serif;font-size:26px;font-style:italic;color:#f0ede8;letter-spacing:0.12em">TRÄNCËNÐ</p>
        </td></tr>

        <tr><td style="padding:40px 36px">

          <p style="margin:0 0 6px;font-family:monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#888">
            Bienvenue dans le LAB
          </p>
          <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#111;font-weight:400;line-height:1.2">
            Vous faites maintenant<br>partie du mouvement.
          </h1>

          <p style="margin:0 0 28px;font-size:13px;color:#555;line-height:1.9">
            Merci de rejoindre TRÄNCËNÐ. Vous serez parmi les premiers informés de nos nouvelles collections,
            drops exclusifs et événements. Chaque pièce est pensée pour ceux qui refusent les limites.
          </p>

          <div style="background:#f0ede8;border-left:3px solid #111;padding:16px 20px;margin-bottom:32px">
            <p style="margin:0;font-family:monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#555">
              L'amour du dépassement — TRÄNCËNÐ LAB
            </p>
          </div>

          <a href="https://trancendstore.com/shop"
            style="display:inline-block;padding:14px 28px;background:#111110;color:#f0ede8;font-family:monospace;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none">
            DÉCOUVRIR LA COLLECTION →
          </a>

        </td></tr>

        <tr><td style="background:#f0ede8;padding:20px 36px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">
            © ${new Date().getFullYear()} TRÄNCËNÐ — Vous recevez cet email car vous vous êtes inscrit sur trancendstore.com
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
