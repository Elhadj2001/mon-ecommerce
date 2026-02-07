import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { convertToXof } from '@/lib/currency' // <-- Import de l'utilitaire

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', 
  typescript: true,
})

interface CheckoutItem {
  id: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const items = json.items as CheckoutItem[]

    if (!items || items.length === 0) {
      return new NextResponse("Panier vide", { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return new NextResponse("Erreur config: NEXT_PUBLIC_APP_URL manquant", { status: 500 });
    }

    const productIds = items.map((item) => item.id)
    
    // On récupère les produits (Prix en EUR dans la DB)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // --- 1. VERIFICATION DU STOCK (Anti-Overselling) ---
    for (const item of items) {
        const product = products.find((p) => p.id === item.id)
        
        if (!product) {
            return new NextResponse(`Produit introuvable: ${item.id}`, { status: 400 })
        }

        if (product.isArchived) {
            return new NextResponse(`Le produit "${product.name}" n'est plus disponible.`, { status: 400 })
        }

        if (product.stock < item.quantity) {
            return new NextResponse(`Stock insuffisant pour "${product.name}". (Disponible: ${product.stock})`, { status: 400 })
        }
    }
    // ---------------------------------------------------

    items.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) return

      const descriptionParts: string[] = []
      if (item.selectedSize) descriptionParts.push(`Taille: ${item.selectedSize}`)
      if (item.selectedColor) descriptionParts.push(`Couleur: ${item.selectedColor}`)
      const cleanDescription = descriptionParts.join(' - ')

      const validImages = product.images
        .map((img) => img.url)
        .filter((url) => url.startsWith('http'))
        .slice(0, 8)

      // CONVERSION DU PRIX EUR -> XOF
      const priceInXof = convertToXof(Number(product.price));

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: 'XOF', // CHANGEMENT DEVISE
          product_data: {
            name: product.name,
            description: cleanDescription.length > 0 ? cleanDescription : undefined,
            images: validImages.length > 0 ? validImages : undefined,
          },
          // IMPORTANT: Pas de multiplication par 100 pour le XOF
          unit_amount: priceInXof, 
        },
      })
    })

    const order = await prisma.order.create({
      data: {
        isPaid: false,
        orderItems: {
          create: items.map((item) => ({
            product: { connect: { id: item.id } },
            quantity: item.quantity,
            size: item.selectedSize || null,
            color: item.selectedColor || null
          }))
        }
      }
    })

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        // Ajout du Sénégal (SN), Côte d'ivoire (CI), etc.
        allowed_countries: ['FR', 'SN', 'BE', 'CA', 'CI'],
      },
      phone_number_collection: {
        enabled: true,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`, 
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id
      }
    })

    return NextResponse.json({ url: session.url }, { headers: corsHeaders })

  } catch (error: unknown) {
    console.error("[STRIPE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur interne inconnue"
    return new NextResponse(errorMessage, { status: 500 })
  }
}