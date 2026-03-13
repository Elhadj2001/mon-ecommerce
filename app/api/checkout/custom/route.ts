import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

interface CheckoutItem {
  id: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CASH_ON_DELIVERY' | 'PAYPAL'

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['WAVE', 'ORANGE_MONEY', 'CASH_ON_DELIVERY', 'PAYPAL']


export async function POST(req: Request) {
  try {
    const { userId } = await auth()

    const json = await req.json()
    const { items, customer, paymentMethod, promoCode, discount, shippingCost } = json as {
      items: CheckoutItem[]
      customer: {
        name: string
        phone: string
        email?: string
        address?: string
        city?: string
      }
      paymentMethod: PaymentMethod
      promoCode?: string | null
      discount?: number
      shippingCost?: number
    }

    // --- Validations ---
    if (!items || items.length === 0) {
      return new NextResponse("Panier vide", { status: 400 })
    }

    if (!customer?.name || !customer?.phone) {
      return new NextResponse("Nom et numéro de téléphone obligatoires", { status: 400 })
    }

    if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
      return new NextResponse("Veuillez choisir un moyen de paiement valide", { status: 400 })
    }

    if (paymentMethod === 'CASH_ON_DELIVERY' && !customer.address) {
      return new NextResponse("Une adresse de livraison est requise pour le paiement à la livraison", { status: 400 })
    }

    const productIds = items.map((item) => item.id)

    // Vérification des produits et du stock
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    })

    for (const item of items) {
      const product = products.find((p) => p.id === item.id)
      if (!product) {
        return new NextResponse(`Produit introuvable: ${item.id}`, { status: 400 })
      }
      if (product.isArchived) {
        return new NextResponse(`Le produit "${product.name}" n'est plus disponible.`, { status: 400 })
      }
      if (product.stock < item.quantity) {
        return new NextResponse(
          `Stock insuffisant pour "${product.name}". (Disponible: ${product.stock})`,
          { status: 400 }
        )
      }
    }

    // Décrémentation atomique du stock (anti-overselling)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
      })
    }

    // Alerte stock automatique (email admin si stock critique ou épuisé)
    const updatedProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, stock: true }
    })
    const alertProducts = updatedProducts.filter(p => p.stock <= 3)
    if (alertProducts.length > 0) {
      const { sendStockAlert } = await import('@/lib/stock-alert')
      await sendStockAlert(alertProducts)
    }

    // Incrémenter l'utilisation du code promo
    if (promoCode) {
      await prisma.promoCode.updateMany({
        where: { code: promoCode },
        data: { usedCount: { increment: 1 } }
      })
    }

    // Création de la commande
    const order = await prisma.order.create({
      data: {
        isPaid: false,
        clerkUserId: userId,
        name: customer.name,
        email: customer.email || "",
        phone: customer.phone,
        address: `${customer.address || ''} ${customer.city || ''}`.trim(),
        paymentMethod: paymentMethod,
        status: 'PENDING',
        promoCode: promoCode || null,
        discount: discount || 0,
        shippingCost: shippingCost || 0,
        orderItems: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity,
            size: item.selectedSize || null,
            color: item.selectedColor || null
          }))
        }
      },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })

    // Calcul du total pour l'email
    const total = order.orderItems.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity, 0
    )

    // Envoi de l'email de confirmation au client et de la notification à l'admin
    const { sendOrderStatusEmail, sendAdminOrderNotification } = await import('@/lib/send-order-email')
    
    const emailData = {
      orderId: order.id,
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      status: 'PENDING',
      paymentMethod: order.paymentMethod,
      total,
      items: order.orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.product.price),
        size: item.size,
        color: item.color,
      }))
    }

    await Promise.all([
      sendOrderStatusEmail(emailData),
      sendAdminOrderNotification(emailData)
    ])

    return NextResponse.json({ orderId: order.id })

  } catch (error: unknown) {
    console.error("[CUSTOM_CHECKOUT_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur interne"
    return new NextResponse(errorMessage, { status: 500 })
  }
}
