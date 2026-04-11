/**
 * /src/routes/api/contact.ts
 * Route POST /api/contact
 * Envoie un email au propriétaire + accusé de réception au client via Brevo
 */
import { json } from "@solidjs/router";

const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const STORE_EMAIL = process.env.STORE_EMAIL || "contact@trancendstore.com";
const STORE_NAME = "TRÄNCËNÐ";

async function sendEmail(to: string, subject: string, html: string, name = "") {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: STORE_NAME, email: STORE_EMAIL },
      to: [{ email: to, name: name || to }],
      subject,
      htmlContent: html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[brevo] contact error:", res.status, err);
    throw new Error("Erreur envoi email");
  }
  console.log("[brevo] contact email sent to:", to);
}

export async function POST({ request }: { request: Request }) {
  let body: any;
  try { body = await request.json(); }
  catch { return json({ error: "Corps invalide" }, { status: 400 }); }

  const { name, email, message } = body;

  if (!name?.trim()) return json({ error: "Nom requis" }, { status: 400 });
  if (!email?.trim()) return json({ error: "Email requis" }, { status: 400 });
  if (!message?.trim()) return json({ error: "Message requis" }, { status: 400 });

  try {
    // Email au propriétaire
    await sendEmail(
      STORE_EMAIL,
      `📩 Nouveau message de ${name} — TRÄNCËNÐ Contact`,
      buildOwnerEmail({ name, email, message }),
      STORE_NAME,
    );

    // Accusé de réception au client
    await sendEmail(
      email,
      `TRÄNCËNÐ — Votre message a bien été reçu`,
      buildClientAckEmail({ name }),
      name,
    );

    return json({ success: true });
  } catch (err: any) {
    console.error("[contact] Error:", err);
    return json({ error: "Erreur lors de l'envoi. Réessayez." }, { status: 500 });
  }
}

// ── Email propriétaire ────────────────────────────────────────────

function buildOwnerEmail(opts: { name: string; email: string; message: string }) {
  return `
<!DOCTYPE html><html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">

        <tr><td style="background:#111110;padding:24px 32px">
          <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ — Contact</p>
        </td></tr>

        <tr><td style="padding:32px">
          <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:18px;color:#111;font-weight:400">
            📩 Nouveau message reçu
          </h1>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e8e3dc">
            <tr>
              <td style="padding:12px 16px;background:#f5f2ee;border-bottom:1px solid #e8e3dc">
                <p style="margin:0;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Expéditeur</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#111">${opts.name}</p>
                <p style="margin:2px 0 0;font-size:13px;color:#555">
                  <a href="mailto:${opts.email}" style="color:#111">${opts.email}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px">
                <p style="margin:0 0 8px;font-family:monospace;font-size:9px;color:#888;text-transform:uppercase;letter-spacing:0.18em">Message</p>
                <p style="margin:0;font-size:13px;color:#333;line-height:1.8;white-space:pre-wrap">${opts.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </td>
            </tr>
          </table>

          <a href="mailto:${opts.email}?subject=Re: Votre message TRÄNCËNÐ"
            style="display:inline-block;padding:12px 24px;background:#111110;color:#f0ede8;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;text-decoration:none">
            RÉPONDRE →
          </a>
        </td></tr>

        <tr><td style="background:#f0ede8;padding:16px 32px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">
            © ${new Date().getFullYear()} TRÄNCËNÐ — Notification interne
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Email accusé de réception client ─────────────────────────────

function buildClientAckEmail(opts: { name: string }) {
  return `
<!DOCTYPE html><html lang="fr">
<body style="margin:0;padding:0;background:#f0ede8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px;width:100%">

        <tr><td style="background:#111110;padding:24px 32px">
          <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-style:italic;color:#f0ede8;letter-spacing:0.1em">TRÄNCËNÐ</p>
        </td></tr>

        <tr><td style="padding:36px">
          <h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:20px;color:#111;font-weight:400">
            Message reçu ✓
          </h1>
          <p style="margin:0 0 24px;font-size:13px;color:#666;line-height:1.8">
            Bonjour ${opts.name},<br>
            Nous avons bien reçu votre message et vous répondrons sous <strong>48h</strong>.
          </p>

          <div style="background:#f5f2ee;border-left:3px solid #111;padding:14px 18px;margin-bottom:28px">
            <p style="margin:0;font-size:12px;color:#555;line-height:1.7">
              En attendant, n'hésitez pas à parcourir notre collection sur
              <a href="https://trancendstore.com/shop" style="color:#111;font-weight:600">trancendstore.com</a>.
            </p>
          </div>

          <p style="font-size:12px;color:#999;line-height:1.7;margin:0">
            Contact direct : <a href="mailto:${STORE_EMAIL}" style="color:#111">${STORE_EMAIL}</a>
          </p>
        </td></tr>

        <tr><td style="background:#f0ede8;padding:16px 32px;border-top:1px solid #ccc9c2">
          <p style="margin:0;font-family:monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#888">
            © ${new Date().getFullYear()} TRÄNCËNÐ — L'amour du dépassement
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
