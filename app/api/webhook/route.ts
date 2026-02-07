import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/mail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

export async function POST(req: Request) {
  const body = await req.text()
  
  const headersList = await headers()
  const signature = headersList.get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session?.customer_details?.email
    const address = session?.customer_details?.address
    const addressString = [
        address?.line1,
        address?.city,
        address?.country,
        address?.postal_code
    ].filter(Boolean).join(', ')

    const phone = session?.customer_details?.phone || ''
    const orderId = session?.metadata?.orderId

    if (orderId && email) {
        
        try {
            // --- TRANSACTION ATOMIQUE (Le cœur de la correction) ---
            // On récupère d'abord la commande pour avoir les items
            const orderWithItems = await prisma.order.findUnique({
                where: { id: orderId },
                include: { 
                    orderItems: {
                        include: { product: true }
                    } 
                }
            })

            if (!orderWithItems) throw new Error("Order not found");

            // On lance la transaction : Tout réussit ou tout échoue.
            await prisma.$transaction(async (tx) => {
                
                // 1. Marquer comme payé
                await tx.order.update({
                    where: { id: orderId },
                    data: { 
                        isPaid: true, 
                        address: addressString, 
                        phone: phone 
                    },
                });

                // 2. Décrémenter le stock
                for (const item of orderWithItems.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    });
                }
            });
            // --- FIN TRANSACTION ---

            // 3. ENVOI EMAIL (En dehors de la transaction car si l'email échoue, on ne veut pas annuler la vente)
            const total = orderWithItems.orderItems.reduce((acc, item) => {
                return acc + (Number(item.product.price) * item.quantity);
            }, 0);

            await sendOrderEmail(email, orderId, total);
            console.log(`✅ Commande ${orderId} validée et stock mis à jour.`);

        } catch (error) {
            console.error("❌ Erreur critique lors du traitement webhook :", error);
            return new NextResponse("Database/Stock Error", { status: 500 });
        }
    }
  }

  return new NextResponse(null, { status: 200 })
}