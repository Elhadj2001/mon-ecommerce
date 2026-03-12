import { Resend } from 'resend';
import { formatPrice } from '@/lib/currency';

const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mon-ecommerce-rho.vercel.app';

export const sendOrderEmail = async (
  email: string, 
  orderId: string, 
  totalAmountInEur: number
) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("[MAIL] Clé API Resend manquante.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const formattedPrice = formatPrice(totalAmountInEur);
    const shortId = orderId.substring(0, 8).toUpperCase();
    const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const username = email.split('@')[0];

    const data = await resend.emails.send({
      from: `MAISON NIANG Boutique <${FROM_EMAIL}>`,
      replyTo: 'eniang68@gmail.com',
      to: email,
      subject: `✅ Commande confirmée #${shortId} — Merci !`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                
                <tr>
                  <td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">MAISON NIANG</h1>
                    <p style="margin:8px 0 0;color:#c9a84c;font-size:10px;letter-spacing:3px;text-transform:uppercase;">Saint-Louis · Paris — L'élégance sans compromis</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:40px;text-align:center;border-bottom:1px solid #f0f0f0;">
                    <div style="width:64px;height:64px;background:#d1fae5;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:32px;">✅</div>
                    <h2 style="margin:0 0 8px;color:#0a0a0a;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Commande confirmée !</h2>
                    <p style="margin:0;color:#71717a;font-size:15px;">Merci pour votre achat, ${username} 🎉</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:#f9f9f9;border-radius:12px;padding:20px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:8px 0;border-bottom:1px solid #e4e4e7;vertical-align:top;">
                                <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Référence commande</div>
                                <div style="color:#0a0a0a;font-size:18px;font-weight:900;letter-spacing:4px;">#${shortId}</div>
                              </td>
                              <td style="text-align:right;padding:8px 0;border-bottom:1px solid #e4e4e7;vertical-align:top;">
                                <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Date</div>
                                <div style="color:#0a0a0a;font-size:14px;font-weight:600;">${date}</div>
                              </td>
                            </tr>
                            <tr>
                              <td colspan="2" style="padding-top:16px;">
                                <div style="color:#71717a;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Total réglé</div>
                                <div style="color:#0a0a0a;font-size:24px;font-weight:900;">${formattedPrice}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:24px 0 8px;color:#3f3f46;font-size:14px;line-height:1.6;">
                      Votre commande est en cours de préparation. Vous recevrez un email dès qu'elle sera expédiée.
                    </p>

                    <div style="text-align:center;margin-top:28px;">
                      <a href="${APP_URL}/account/orders" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-weight:800;font-size:13px;text-transform:uppercase;letter-spacing:2px;">
                        Voir mes commandes →
                      </a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #f0f0f0;">
                    <p style="margin:0 0 4px;font-size:12px;color:#a1a1aa;">Email envoyé automatiquement — merci de ne pas y répondre.</p>
                    <p style="margin:0;font-size:11px;color:#d4d4d8;">© ${new Date().getFullYear()} MAISON NIANG — Tous droits réservés</p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `
    });

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: true, id: data.data?.id };

  } catch (error) {
    console.error("[MAIL] Exception lors de l'envoi:", error);
    return { success: false, error };
  }
};