import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Utilise la version suggérée par ton VS Code
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
  const json = await req.json()
  const items = json.items as CheckoutItem[]

  if (!items || items.length === 0) {
    return new NextResponse("Aucun article dans le panier", { status: 400 })
  }

  const productIds = items.map((item) => item.id)
  
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    }
  })

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

  items.forEach((item) => {
    const product = products.find((p) => p.id === item.id)

    if (!product) return

    // On construit la description
    let description = ""
    if (item.selectedSize) description += `Taille: ${item.selectedSize} `
    if (item.selectedColor) description += `- Couleur: ${item.selectedColor}`
    
    // On nettoie les espaces
    const cleanDescription = description.trim()

    line_items.push({
      quantity: item.quantity,
      price_data: {
        currency: 'EUR',
        product_data: {
          name: product.name,
          // ⚠️ C'EST ICI LA CORRECTION MAGIQUE ⚠️
          // Si cleanDescription est vide, on envoie undefined.
          // Si on envoie "", Stripe plante.
          description: cleanDescription.length > 0 ? cleanDescription : undefined,
          images: product.images && product.images[0] ? [product.images[0]] : [],
        },
        unit_amount: Math.round(product.price.toNumber() * 100),
      },
    })
  })

  const order = await prisma.order.create({
    data: {
      isPaid: false,
      orderItems: {
        create: items.map((item) => ({
          product: { connect: { id: item.id } },
          quantity: item.quantity
        }))
      }
    }
  })

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
    // On garde ta redirection vers la page Success
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id
    }
  })

  return NextResponse.json({ url: session.url }, { headers: corsHeaders })
}