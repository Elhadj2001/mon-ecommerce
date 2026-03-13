import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente de paiement",
  PAYMENT_RECEIVED: "Paiement reçu",
  PROCESSING: "En préparation",
  SHIPPED: "Commande expédiée",
  DELIVERED: "Commande livrée",
  CANCELLED: "Commande annulée",
}

const PAYMENT_LABELS: Record<string, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  CASH_ON_DELIVERY: "Paiement à la livraison",
  PAYPAL: "PayPal",
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  status: string
  paymentMethod: string
  total: number
  items: { name: string; quantity: number; price: number; size?: string | null; color?: string | null }[]
}

// IMPORTANT : Les prix en BDD sont en EUR — on convertit en FCFA pour l'affichage
const EXCHANGE_RATE = 655.957

function formatCFA(amountInEur: number): string {
  const xof = Math.round(amountInEur * EXCHANGE_RATE)
  return new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(xof) + ' FCFA'
}

export async function sendOrderStatusEmail(data: OrderEmailData) {
  // Si pas de clé API ou pas d'email client, on skip silencieusement
  if (!process.env.RESEND_API_KEY || !data.customerEmail) {
    console.log("[EMAIL] Skipped: no API key or no customer email")
    return null
  }

  const statusLabel = STATUS_LABELS[data.status] || data.status
  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod
  const orderRef = data.orderId.slice(0, 8).toUpperCase()
  const firstName = data.customerName.split(' ')[0] || 'Client'

  // Sujet selon le statut
  const subjects: Record<string, string> = {
    PENDING: `Commande #${orderRef} enregistrée — Maison Niang`,
    PAYMENT_RECEIVED: `Paiement reçu pour #${orderRef} ✅ — Maison Niang`,
    PROCESSING: `Commande #${orderRef} en préparation 📦 — Maison Niang`,
    SHIPPED: `Commande #${orderRef} expédiée 🚚 — Maison Niang`,
    DELIVERED: `Commande #${orderRef} livrée ✨ — Maison Niang`,
    CANCELLED: `Commande #${orderRef} annulée — Maison Niang`,
  }

  const subject = subjects[data.status] || `Mise à jour commande #${orderRef} — Maison Niang`

  // Construction de la liste des articles en HTML
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong><br/>
        <span style="color: #888; font-size: 12px;">
          Qté: ${item.quantity}
          ${item.size ? ` • Taille: ${item.size}` : ''}
          ${item.color ? ` • ${item.color}` : ''}
        </span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold;">
        ${formatCFA(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

      <!-- Header -->
      <div style="background: #000; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">MAISON NIANG</h1>
        <p style="color: #c9a84c; margin: 5px 0 0; font-size: 11px; letter-spacing: 2px;">MODE CONTEMPORAINE</p>
      </div>

      <!-- Corps -->
      <div style="background: #fff; padding: 40px 30px; border-radius: 0 0 16px 16px; border: 1px solid #eee; border-top: none;">

        <p style="font-size: 16px; color: #333;">Bonjour <strong>${firstName}</strong>,</p>

        <!-- Statut -->
        <div style="background: #f8f8f8; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px;">Statut de votre commande</p>
          <p style="font-size: 18px; font-weight: bold; color: #000; margin: 0;">${statusLabel}</p>
          <p style="font-size: 12px; color: #888; margin: 8px 0 0;">Ref: #${orderRef} • ${paymentLabel}</p>
        </div>

        <!-- Articles -->
        <h3 style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin: 30px 0 15px;">Vos articles</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>

        <!-- Total -->
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px dashed #eee; display: flex; justify-content: space-between;">
          <table style="width: 100%;"><tr>
            <td style="font-weight: bold; font-size: 16px;">Total</td>
            <td style="text-align: right; font-weight: bold; font-size: 20px;">${formatCFA(data.total)}</td>
          </tr></table>
        </div>

        <!-- Suivi -->
        <div style="margin-top: 30px; text-align: center;">
          <a href="https://www.maison-niang.fr/success/${data.orderId}"
             style="display: inline-block; background: #000; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Suivre ma commande
          </a>
        </div>

        <!-- Contact -->
        <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center; line-height: 1.6;">
          Une question ? Contactez-nous sur WhatsApp au <strong>${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+221 78 173 79 59'}</strong>
        </p>

      </div>

      <!-- Footer -->
      <p style="text-align: center; font-size: 11px; color: #aaa; margin-top: 20px;">
        © Maison Niang — Saint-Louis • Paris<br/>
        <a href="https://www.maison-niang.fr" style="color: #aaa;">www.maison-niang.fr</a>
      </p>
    </div>
  </body>
  </html>
  `

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Maison Niang <onboarding@resend.dev>',
      to: data.customerEmail,
      subject,
      html,
    })
    console.log("[EMAIL] Sent successfully:", result)
    return result
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error)
    return null
  }
}

export async function sendAdminOrderNotification(data: OrderEmailData) {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!process.env.RESEND_API_KEY || !adminEmail) {
    console.log("[ADMIN_EMAIL] Skipped: no API key or no ADMIN_EMAIL configured")
    return null
  }

  const paymentLabel = PAYMENT_LABELS[data.paymentMethod] || data.paymentMethod
  const orderRef = data.orderId.slice(0, 8).toUpperCase()

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <strong>${item.name}</strong><br/>
        <span style="color: #666; font-size: 13px;">
          Qté: ${item.quantity}
          ${item.size ? ` • Taille: ${item.size}` : ''}
          ${item.color ? ` • Couleur: ${item.color}` : ''}
        </span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold;">
        ${formatCFA(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      
      <!-- Header -->
      <div style="background: #09090b; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px;">Nouvelle Commande 🚨</h1>
        <p style="color: #c9a84c; margin: 5px 0 0; font-size: 13px;">${formatCFA(data.total)} — ${paymentLabel}</p>
      </div>

      <!-- Corps -->
      <div style="background: #fff; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #eee; border-top: none;">
        
        <h3 style="margin-top: 0; color: #333; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Informations Client</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #555; margin-bottom: 30px;">
          <strong>Nom :</strong> ${data.customerName}<br>
          <strong>Téléphone :</strong> <a href="tel:${data.customerPhone}" style="color: #25D366; font-weight: bold;">${data.customerPhone}</a><br>
          <strong>Email :</strong> <a href="mailto:${data.customerEmail}" style="color: #0066cc;">${data.customerEmail || 'Non renseigné'}</a>
        </p>

        <h3 style="margin-top: 0; color: #333; font-size: 16px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Détails (Réf: ${orderRef})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          ${itemsHtml}
        </table>

        <!-- Total -->
        <div style="padding-top: 15px; border-top: 2px dashed #ddd; display: flex; justify-content: space-between;">
          <table style="width: 100%;"><tr>
            <td style="font-weight: bold; font-size: 16px;">TOTAL À ENCAISSER</td>
            <td style="text-align: right; font-weight: black; font-size: 22px; color: #09090b;">${formatCFA(data.total)}</td>
          </tr></table>
        </div>

        <div style="margin-top: 40px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders"
             style="display: inline-block; background: #c9a84c; color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
            Traiter la commande
          </a>
        </div>

      </div>
    </div>
  </body>
  </html>
  `

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Maison Niang Admin <onboarding@resend.dev>',
      to: adminEmail,
      subject: `🚨 NOUVELLE COMMANDE : ${formatCFA(data.total)} — ${data.customerName}`,
      html,
    })
    console.log("[ADMIN_EMAIL] Sent successfully:", result)
    return result
  } catch (error) {
    console.error("[ADMIN_EMAIL] Failed to send:", error)
    return null
  }
}
