import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { sendOrderStatusEmail } from '@/lib/send-order-email'

const VALID_STATUSES = ['PENDING', 'PAYMENT_RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const { orderId } = await params
    const body = await req.json()
    const { status } = body

    if (!status || !VALID_STATUSES.includes(status)) {
      return new NextResponse("Statut invalide", { status: 400 })
    }

    // Mise à jour du statut + isPaid si le paiement est confirmé
    const isPaid = ['PAYMENT_RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status)

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status, isPaid },
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

    // Envoi du mail automatique au client
    const subtotal = total
    const shippingCost = Number(order.shippingCost) || 0
    const discount = Number(order.discount) || 0
    const finalTotal = Math.max(0, subtotal + shippingCost - discount)

    await sendOrderStatusEmail({
      orderId: order.id,
      customerName: order.name,
      customerEmail: order.email,
      customerPhone: order.phone,
      status: order.status,
      paymentMethod: order.paymentMethod,
      total: finalTotal,
      subtotal,
      shippingCost,
      discount,
      promoCode: order.promoCode,
      items: order.orderItems.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.product.price),
        size: item.size,
        color: item.color,
      }))
    })

    return NextResponse.json({ success: true, order })

  } catch (error) {
    console.error("[ADMIN_ORDER_UPDATE]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
}
