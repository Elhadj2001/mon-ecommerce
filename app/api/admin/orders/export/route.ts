import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })

    const EXCHANGE_RATE = 655.957

    // En-têtes CSV
    const headers = [
      'Référence', 'Date', 'Client', 'Téléphone', 'Email', 'Adresse',
      'Paiement', 'Statut', 'Payé', 'Articles', 'Sous-total (FCFA)',
      'Frais Livraison (FCFA)', 'Réduction (FCFA)', 'Total (FCFA)', 'Code Promo'
    ].join(';')

    const rows = orders.map(order => {
      const subtotal = order.orderItems.reduce(
        (acc, item) => acc + Number(item.product.price) * item.quantity, 0
      )
      const articles = order.orderItems.map(
        item => `${item.quantity}x ${item.product.name}${item.size ? ` (${item.size})` : ''}${item.color ? ` [${item.color}]` : ''}`
      ).join(' | ')

      const subtotalXOF = Math.round(subtotal * EXCHANGE_RATE)
      const shippingXOF = Math.round(Number(order.shippingCost) * EXCHANGE_RATE)
      const discountXOF = Math.round(Number(order.discount) * EXCHANGE_RATE)
      const totalXOF = subtotalXOF + shippingXOF - discountXOF

      return [
        `#${order.id.slice(0, 8).toUpperCase()}`,
        new Date(order.createdAt).toLocaleDateString('fr-FR'),
        `"${order.name}"`,
        order.phone,
        order.email,
        `"${order.address}"`,
        order.paymentMethod,
        order.status,
        order.isPaid ? 'Oui' : 'Non',
        `"${articles}"`,
        subtotalXOF,
        shippingXOF,
        discountXOF,
        totalXOF,
        order.promoCode || ''
      ].join(';')
    })

    const csv = '\uFEFF' + [headers, ...rows].join('\n') // BOM UTF-8 pour Excel
    
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="commandes_maison_niang_${new Date().toISOString().slice(0,10)}.csv"`,
      }
    })

  } catch (error) {
    console.error("[EXPORT_CSV]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
}
