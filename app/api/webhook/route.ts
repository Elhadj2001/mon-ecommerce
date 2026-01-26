import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/mail'; // Importe la fonction

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true })

export async function POST(req: Request) {
  const body = await req.text()
  
  // --- CORRECTION NEXT.JS 15 ---
  // On doit ajouter 'await' devant headers()
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
    const email = session?.customer_details?.email; // On récupère l'email du client chez Stripe    

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
        // 1. Mise à jour commande et stock (ton code existant)
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { isPaid: true, address: addressString, phone: phone },
            include: { orderItems: { include: { product: true } } }
        });

        // Calcul du total pour le mail
        const total = order.orderItems.reduce((acc, item) => {
            return acc + (Number(item.product.price) * item.quantity);
        }, 0);

        // 2. ENVOI DU MAIL AUTOMATIQUE 🚀
        await sendOrderEmail(email, orderId, total);
        
        console.log(`✅ Mail de confirmation envoyé à ${email}`);
    }
  }

  return new NextResponse(null, { status: 200 })
}