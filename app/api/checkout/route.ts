import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// 1. Définition stricte du type (Plus de any)
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
    // 2. On caste les données reçues avec l'interface stricte
    const items = json.items as CheckoutItem[]

    if (!items || items.length === 0) {
      return new NextResponse("Panier vide", { status: 400 })
    }

    // 3. Vérification critique de l'URL pour éviter le crash Stripe
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return new NextResponse("Erreur config: NEXT_PUBLIC_APP_URL manquant", { status: 500 });
    }

    const productIds = items.map((item) => item.id)
    
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: true }
    })

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

    // 4. Boucle typée proprement (TypeScript infère le type 'item' grâce à l'interface ci-dessus)
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.id)
      if (!product) return

      // Construction propre de la description
      const descriptionParts: string[] = []
      if (item.selectedSize) descriptionParts.push(`Taille: ${item.selectedSize}`)
      if (item.selectedColor) descriptionParts.push(`Couleur: ${item.selectedColor}`)
      const cleanDescription = descriptionParts.join(' - ')

      // Filtrage des images (Uniquement http/https pour éviter l'erreur 400)
      const validImages = product.images
        .map((img) => img.url)
        .filter((url) => url.startsWith('http'))
        .slice(0, 8)

      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: 'EUR',
          product_data: {
            name: product.name,
            // Si la description est vide, on envoie undefined (car "" peut causer une erreur)
            description: cleanDescription.length > 0 ? cleanDescription : undefined,
            // Idem pour les images
            images: validImages.length > 0 ? validImages : undefined,
          },
          // Conversion stricte en entier
          unit_amount: Math.round(Number(product.price) * 100),
        },
      })
    })

    // Création de la commande
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

    // Création de la session Stripe
    // ... dans app/api/checkout/route.ts ...

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'SN', 'BE', 'CA'],
      },
      phone_number_collection: {
        enabled: true,
      },
      
      // --- C'EST ICI QU'IL FAUT CHANGER ---
      // AVANT (Ce que tu avais probablement) :
      // success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?success=1`,

      // APRÈS (Ce qu'il faut mettre pour activer ta page) :
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`, 
      
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id
      }
    })

    return NextResponse.json({ url: session.url }, { headers: corsHeaders })

  } catch (error: unknown) {
    // 5. Gestion d'erreur sans 'any'
    console.error("[STRIPE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur interne inconnue"
    return new NextResponse(errorMessage, { status: 400 }) // 400 pour voir l'erreur côté client
  }
}