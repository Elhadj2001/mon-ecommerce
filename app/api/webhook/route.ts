import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/mail' // On garde ton import

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Assure-toi d'avoir la bonne date ici (celle suggérée par VS Code)
  typescript: true,
})

export async function POST(req: Request) {
  const body = await req.text()
  
  // Correction Next.js 15 (Tu avais bon !)
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
        // 1. Mise à jour commande (Statut payé + Infos client)
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { 
                isPaid: true, 
                address: addressString, 
                phone: phone 
            },
            include: { 
                orderItems: { 
                    include: { product: true } 
                } 
            }
        });

        // 2. GESTION DES STOCKS (C'est la partie qui manquait !) 📉
        // On boucle sur chaque article pour réduire le stock
        for (const item of order.orderItems) {
            await prisma.product.update({
                where: { id: item.productId },
                data: {
                    stock: { 
                        decrement: item.quantity 
                    }
                }
            })
        }

        // 3. ENVOI DU MAIL AUTOMATIQUE 📧
        // Calcul du total pour le mail (convertit Decimal en Number)
        const total = order.orderItems.reduce((acc, item) => {
            return acc + (Number(item.product.price) * item.quantity);
        }, 0);

        try {
            await sendOrderEmail(email, orderId, total);
            console.log(`✅ Mail de confirmation envoyé à ${email}`);
        } catch (emailError) {
            console.error("⚠️ Erreur lors de l'envoi de l'email:", emailError);
            // On ne bloque pas le webhook si l'email échoue, le paiement est déjà validé
        }
    }
  }

  return new NextResponse(null, { status: 200 })
}