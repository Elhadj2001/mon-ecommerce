import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface StockAlertProduct {
  name: string
  stock: number
  id: string
}

/**
 * Envoie un email d'alerte stock bas ou épuisé à l'admin.
 * Appelé automatiquement après décrémentation du stock dans l'API checkout.
 */
export async function sendStockAlert(products: StockAlertProduct[]) {
  if (!process.env.RESEND_API_KEY) {
    console.log("[STOCK_ALERT] Skipped: no RESEND_API_KEY")
    return null
  }

  const adminEmail = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL?.match(/<(.+)>/)?.[1] || 'onboarding@resend.dev'

  const outOfStock = products.filter(p => p.stock <= 0)
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 3)

  if (outOfStock.length === 0 && lowStock.length === 0) return null

  const subject = outOfStock.length > 0
    ? `🚨 RUPTURE DE STOCK — ${outOfStock.map(p => p.name).join(', ')}`
    : `⚠️ Stock critique — ${lowStock.map(p => p.name).join(', ')}`

  const outOfStockHtml = outOfStock.length > 0 ? `
    <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="color: #dc2626; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
        🚨 Produits Épuisés
      </h3>
      ${outOfStock.map(p => `
        <div style="background: white; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #111;">${p.name}</strong>
          <span style="background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">ÉPUISÉ</span>
        </div>
      `).join('')}
    </div>
  ` : ''

  const lowStockHtml = lowStock.length > 0 ? `
    <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
      <h3 style="color: #d97706; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
        ⚠️ Stock Critique (≤ 3)
      </h3>
      ${lowStock.map(p => `
        <div style="background: white; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #111;">${p.name}</strong>
          <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${p.stock} restant${p.stock > 1 ? 's' : ''}</span>
        </div>
      `).join('')}
    </div>
  ` : ''

  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body style="margin: 0; padding: 0; background: #f7f7f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background: #000; padding: 24px; text-align: center; border-radius: 16px 16px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 16px; letter-spacing: 3px; text-transform: uppercase;">MAISON NIANG — ADMIN</h1>
        <p style="color: #c9a84c; margin: 4px 0 0; font-size: 10px; letter-spacing: 2px;">ALERTE STOCK AUTOMATIQUE</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 16px 16px; border: 1px solid #eee; border-top: none;">
        <p style="font-size: 14px; color: #333; margin-bottom: 20px;">
          Bonjour,<br/>Des produits nécessitent votre attention :
        </p>
        ${outOfStockHtml}
        ${lowStockHtml}
        <div style="margin-top: 24px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.maison-niang.fr'}/admin/products"
             style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">
            Gérer le stock
          </a>
        </div>
      </div>
      <p style="text-align: center; font-size: 10px; color: #aaa; margin-top: 16px;">
        Email automatique — Maison Niang Admin
      </p>
    </div>
  </body>
  </html>
  `

  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Maison Niang <onboarding@resend.dev>',
      to: adminEmail,
      subject,
      html,
    })
    console.log("[STOCK_ALERT] Email sent:", result)
    return result
  } catch (error) {
    console.error("[STOCK_ALERT] Failed:", error)
    return null
  }
}
