import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail, sendAdminAlertEmail } from '@/lib/mail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' })


export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('[WEBHOOK] Signature invalide:', err)
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const orderId = session.metadata?.orderId
    const customerEmail = session.customer_details?.email

    if (!orderId) {
      console.error('[WEBHOOK] orderId manquant dans les metadata')
      return NextResponse.json({ error: 'orderId missing' }, { status: 400 })
    }

    // 1. Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        address: session.customer_details?.address
          ? `${session.customer_details.address.line1}, ${session.customer_details.address.city}, ${session.customer_details.address.country}`
          : '',
        phone: session.customer_details?.phone || '',
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })

    // 2. Décrémenter le stock
    for (const item of updatedOrder.orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // 3. Calculer le total
    const totalEUR = updatedOrder.orderItems.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0
    )

    // 4. Envoyer email de confirmation au CLIENT
    if (customerEmail) {
      await sendOrderEmail(customerEmail, orderId, totalEUR)
    }

    // 5. Envoyer alerte au PROPRIÉTAIRE (email admin Hostinger)
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      await sendAdminAlertEmail(adminEmail, orderId, totalEUR, customerEmail || 'Inconnu', updatedOrder.orderItems)
    }

    console.log(`[WEBHOOK] ✅ Commande ${orderId} traitée avec succès.`)
  }

  return NextResponse.json({ received: true })
}
