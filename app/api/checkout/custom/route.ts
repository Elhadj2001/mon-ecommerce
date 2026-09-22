import { NextResponse } from 'next/server'
import * as z from 'zod'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { customCheckoutSchema } from '@/lib/validations/checkout'
import { rateLimit } from '@/lib/rate-limit'

class CheckoutBusinessError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, { key: 'checkout', limit: 10, windowSeconds: 60 })
    if (!limit.allowed) return limit.response!

    const { userId } = await auth()

    const json = await req.json()
    const parsed = customCheckoutSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation', issues: z.flattenError(parsed.error) },
        { status: 400 },
      )
    }
    const { items, customer, paymentMethod, promoCode, discount, shippingCost } = parsed.data

    const productIds = items.map((item) => item.id)

    // Charge en lecture seule pour pré-calculer les emails & messages d'erreur clairs.
    const productsPreview = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true, isArchived: true },
    })
    const previewById = new Map(productsPreview.map((p) => [p.id, p]))

    for (const item of items) {
      const product = previewById.get(item.id)
      if (!product) {
        return NextResponse.json({ error: `Produit introuvable: ${item.id}` }, { status: 400 })
      }
      if (product.isArchived) {
        return NextResponse.json(
          { error: `Le produit "${product.name}" n'est plus disponible.` },
          { status: 400 },
        )
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuffisant pour "${product.name}". (Disponible: ${product.stock})` },
          { status: 400 },
        )
      }
    }

    // Transaction atomique : décrément stock (avec garde), incrément promo, création commande.
    // Toute opération qui échoue rollback l'ensemble.
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.id,
            isArchived: false,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        })
        if (result.count === 0) {
          const product = previewById.get(item.id)
          throw new CheckoutBusinessError(
            `Stock insuffisant pour "${product?.name ?? item.id}".`,
            409,
          )
        }
      }

      if (promoCode) {
        const promoUpdate = await tx.promoCode.updateMany({
          where: {
            code: promoCode,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          data: { usedCount: { increment: 1 } },
        })
        if (promoUpdate.count === 0) {
          throw new CheckoutBusinessError("Code promo invalide ou expiré", 400)
        }
        // Vérifie le quota après incrément ; rollback si dépassé.
        const updated = await tx.promoCode.findUnique({
          where: { code: promoCode },
          select: { usedCount: true, maxUses: true },
        })
        if (updated && updated.usedCount > updated.maxUses) {
          throw new CheckoutBusinessError("Code promo épuisé", 400)
        }
      }

      return tx.order.create({
        data: {
          isPaid: false,
          clerkUserId: userId,
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone,
          address: `${customer.address || ''} ${customer.city || ''}`.trim(),
          paymentMethod,
          status: 'PENDING',
          promoCode: promoCode || null,
          discount: discount || 0,
          shippingCost: shippingCost || 0,
          orderItems: {
            create: items.map((item) => ({
              product: { connect: { id: item.id } },
              quantity: item.quantity,
              size: item.selectedSize || null,
              color: item.selectedColor || null,
            })),
          },
        },
        include: {
          orderItems: { include: { product: true } },
        },
      })
    }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted })

    // Effets de bord post-transaction (ne doivent pas casser la commande).
    try {
      const alertProducts = await prisma.product.findMany({
        where: { id: { in: productIds }, stock: { lte: 3 } },
        select: { id: true, name: true, stock: true },
      })
      if (alertProducts.length > 0) {
        const { sendStockAlert } = await import('@/lib/stock-alert')
        await sendStockAlert(alertProducts)
      }
    } catch (e) {
      console.error('[CHECKOUT_STOCK_ALERT]', e)
    }

    const subtotal = order.orderItems.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity, 0,
    )
    const finalTotal = Math.max(0, subtotal + (shippingCost || 0) - (discount || 0))

    try {
      const { sendOrderStatusEmail, sendAdminOrderNotification } = await import('@/lib/send-order-email')
      const emailData = {
        orderId: order.id,
        customerName: order.name,
        customerEmail: order.email,
        customerPhone: order.phone,
        status: 'PENDING',
        paymentMethod: order.paymentMethod,
        total: finalTotal,
        subtotal,
        discount: discount || 0,
        shippingCost: shippingCost || 0,
        promoCode: promoCode || null,
        items: order.orderItems.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price),
          size: item.size,
          color: item.color,
        })),
      }
      await Promise.all([
        sendOrderStatusEmail(emailData),
        sendAdminOrderNotification(emailData),
      ])
    } catch (e) {
      console.error('[CHECKOUT_EMAIL]', e)
    }

    return NextResponse.json({ orderId: order.id })

  } catch (error: unknown) {
    if (error instanceof CheckoutBusinessError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("[CUSTOM_CHECKOUT_ERROR]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
