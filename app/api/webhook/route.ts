import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOrderEmail } from '@/lib/mail'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover' as any, // Cast as any pour éviter erreur de version TS stricte
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
    console.error(`[WEBHOOK_ERROR] Signature invalide : ${errorMessage}`);
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    
    // --- CORRECTION MAJEURE : Récupération robuste de l'email ---
    const email = session?.customer_details?.email || session?.customer_email;
    
    const address = session?.customer_details?.address
    const addressString = [
        address?.line1,
        address?.line2, // Ajout ligne 2 si existe
        address?.city,
        address?.country,
        address?.postal_code
    ].filter(Boolean).join(', ')

    const phone = session?.customer_details?.phone || ''
    const orderId = session?.metadata?.orderId

    if (orderId) {
        try {
            console.log(`[WEBHOOK] Traitement commande ${orderId}`);

            // 1. Récupération de la commande
            const orderWithItems = await prisma.order.findUnique({
                where: { id: orderId },
                include: { 
                    orderItems: {
                        include: { product: true }
                    } 
                }
            })

            if (!orderWithItems) {
                console.error(`[WEBHOOK] Commande ${orderId} introuvable en base.`);
                // On retourne 200 pour dire à Stripe "J'ai reçu", sinon il va réessayer pendant 3 jours
                return new NextResponse(null, { status: 200 }); 
            }

            // 2. TRANSACTION DB (Paiement + Stock)
            await prisma.$transaction(async (tx) => {
                // Marquer comme payé
                await tx.order.update({
                    where: { id: orderId },
                    data: { 
                        isPaid: true, 
                        address: addressString, 
                        phone: phone 
                    },
                });

                // Décrémenter le stock
                for (const item of orderWithItems.orderItems) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: { decrement: item.quantity }
                        }
                    });
                }
            });
            
            console.log(`[WEBHOOK] ✅ DB mise à jour pour commande ${orderId}`);

            // 3. ENVOI EMAIL
            // On calcule le total en EUROS (valeur DB)
            const totalInEur = orderWithItems.orderItems.reduce((acc, item) => {
                return acc + (Number(item.product.price) * item.quantity);
            }, 0);

            if (email) {
                const emailResult = await sendOrderEmail(email, orderId, totalInEur);
                if (emailResult.success) {
                    console.log(`[WEBHOOK] 📧 Email envoyé à ${email}`);
                } else {
                    console.error(`[WEBHOOK] ⚠️ Echec envoi email :`, emailResult.error);
                }
            } else {
                console.warn(`[WEBHOOK] ⚠️ Pas d'email trouvé pour la commande ${orderId}`);
            }

        } catch (error) {
            console.error("[WEBHOOK] ❌ Erreur critique transaction/traitement :", error);
            return new NextResponse("Internal Server Error", { status: 500 });
        }
    }
  }

  return new NextResponse(null, { status: 200 })
}