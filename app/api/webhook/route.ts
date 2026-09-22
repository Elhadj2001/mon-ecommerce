import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail, sendAdminAlertEmail } from '@/lib/mail'
import { logger } from '@/lib/logger'

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
      console.error('[WEBHOOK] orderId manquant dans les metadata', { eventId: event.id })
      return NextResponse.json({ error: 'orderId missing' }, { status: 400 })
    }

    // Idempotence : si la commande est déjà payée, on ne refait pas le décrément stock.
    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, isPaid: true },
    })
    if (!existing) {
      console.error('[WEBHOOK] Commande introuvable', { orderId, eventId: event.id })
      return NextResponse.json({ error: 'order not found' }, { status: 404 })
    }
    if (existing.isPaid) {
      logger.info(`[WEBHOOK] Commande ${orderId} déjà traitée (idempotence)`)
      return NextResponse.json({ received: true, duplicate: true })
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          address: session.customer_details?.address
            ? `${session.customer_details.address.line1}, ${session.customer_details.address.city}, ${session.customer_details.address.country}`
            : '',
          phone: session.customer_details?.phone || '',
        },
        include: {
          orderItems: { include: { product: true } },
        },
      })

      for (const item of order.orderItems) {
        const result = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          // Stock épuisé entre temps : on log mais on n'échoue pas le paiement Stripe.
          console.warn('[WEBHOOK] Stock négatif évité', {
            orderId,
            productId: item.productId,
            requested: item.quantity,
          })
        }
      }

      return order
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })

    const totalEUR = updatedOrder.orderItems.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity, 0,
    )

    if (customerEmail) {
      try { await sendOrderEmail(customerEmail, orderId, totalEUR) }
      catch (e) { console.error('[WEBHOOK_EMAIL_CUSTOMER]', e) }
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail) {
      try { await sendAdminAlertEmail(adminEmail, orderId, totalEUR, customerEmail || 'Inconnu', updatedOrder.orderItems) }
      catch (e) { console.error('[WEBHOOK_EMAIL_ADMIN]', e) }
    }

    logger.info(`[WEBHOOK] Commande ${orderId} traitée avec succès.`)
  }

  return NextResponse.json({ received: true })
}
