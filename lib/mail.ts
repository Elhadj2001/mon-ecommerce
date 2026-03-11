import { Resend } from 'resend';
import { formatPrice } from '@/lib/currency'; // Assurez-vous d'avoir créé ce fichier à l'étape précédente

// Initialisation sécurisée
const resend = new Resend(process.env.RESEND_API_KEY || 're_missing_key');
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export const sendOrderEmail = async (
  email: string, 
  orderId: string, 
  totalAmountInEur: number
) => {
  // Vérification basique
  if (!process.env.RESEND_API_KEY) {
      console.error("[MAIL] Clé API Resend manquante.");
      return { success: false, error: "Missing API Key" };
  }

  try {
    // Conversion et formatage pour l'email (Le client veut voir du FCFA)
    // Si vous n'avez pas importé formatPrice, utilisez la ligne ci-dessous :
    // const formattedPrice = new Intl.NumberFormat("fr-FR", { style: 'currency', currency: 'XOF' }).format(totalAmountInEur * 655.957);
    const formattedPrice = formatPrice(totalAmountInEur);

    const data = await resend.emails.send({
      from: `Boutique <${FROM_EMAIL}>`,
      to: email,
      subject: `Confirmation de commande #${orderId.substring(0, 8)} 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
          <h1 style="text-align: center; text-transform: uppercase; letter-spacing: 2px; color: #000;">MONSOON</h1>
          
          <p style="text-align: center; color: #555;">Merci pour votre achat !</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">Commande N°</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">#${orderId}</p>
          </div>

          <p>Votre commande a été validée avec succès et est en cours de préparation.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          
          <div style="display: flex; justify-content: space-between; font-size: 18px;">
            <span>Total réglé :</span>
            <strong>${formattedPrice}</strong>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
            Ceci est un email automatique. Merci de ne pas répondre directement.<br/>
            Retrouvez-nous sur <a href="#" style="color: #000; text-decoration: underline;">Instagram</a>.
          </p>
        </div>
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