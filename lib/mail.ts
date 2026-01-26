import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOrderEmail = async (
  email: string, 
  orderId: string, 
  totalAmount: number
) => {
  try {
    await resend.emails.send({
      from: 'MonStore <onboarding@resend.dev>', // Plus tard, tu pourras mettre ton propre domaine
      to: email,
      subject: 'Confirmation de votre commande 🎉',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
          <h1 style="text-align: center; text-transform: uppercase; letter-spacing: 2px;">MONSOON</h1>
          <p>Merci pour votre achat !</p>
          <p>Votre commande <strong>#${orderId.substring(0, 8)}</strong> a été validée avec succès.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <div style="display: flex; justify-content: space-between;">
            <span>Total réglé :</span>
            <strong>${totalAmount.toFixed(2)} €</strong>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #666;">
            Retrouvez-nous sur <a href="https://instagram.com">Instagram</a> et <a href="https://facebook.com">Facebook</a>.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error("Erreur envoi mail:", error);
  }
};