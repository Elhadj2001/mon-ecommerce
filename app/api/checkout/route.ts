import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Assure-toi que cette version correspond à celle suggérée par ton VS Code
  typescript: true,
})

// 1. DÉFINITION DU TYPE (Pour remplacer 'any')
interface CheckoutItem {
  id: string
  quantity: number
  selectedSize?: string // Optionnel car certains produits n'en ont pas
  selectedColor?: string // Optionnel
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(req: Request) {
  const json = await req.json()
  
  // 2. TYPAGE EXPLICITE : On dit à TS que 'items' est une liste de CheckoutItem
  const items = json.items as CheckoutItem[]

  if (!items || items.length === 0) {
    return new NextResponse("Aucun article dans le panier", { status: 400 })
  }

  // Sécurité : Récupération des IDs pour interroger la BDD
  const productIds = items.map((item) => item.id)
  
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    }
  })

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  // 3. Boucle typée proprement
  items.forEach((item) => {
    const product = products.find((p) => p.id === item.id)

    if (!product) return

    // Construction de la description
    let description = ""
    if (item.selectedSize) description += `Taille: ${item.selectedSize} `
    if (item.selectedColor) description += `- Couleur: ${item.selectedColor}`

    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: 'EUR',
        product_data: {
          name: product.name,
          description: description.trim(),
          images: [product.images[0]],
        },
        // Conversion Decimal (Prisma) -> Number (JS) -> Centimes (Stripe)
        unit_amount: Math.round(product.price.toNumber() * 100),
      },
    })
  })

  // Création de la commande en BDD
  const order = await prisma.order.create({
    data: {
      isPaid: false,
      orderItems: {
        create: items.map((item) => ({
          product: {
            connect: { id: item.id }
          },
          quantity: item.quantity
        }))
      }
    }
  })

  // Création de la session Stripe
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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id
    }
  })

  return NextResponse.json({ url: session.url }, { headers: corsHeaders })
}