import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// POST — Créer un nouveau code promo
export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { code, discountPercent, discountAmount, minOrderAmount, maxUses, expiresAt } = await req.json()

    if (!code) {
      return NextResponse.json({ error: "Le code est requis" }, { status: 400 })
    }

    if (!discountPercent && !discountAmount) {
      return NextResponse.json({ error: "Spécifiez un pourcentage ou un montant de réduction" }, { status: 400 })
    }

    // Vérifier unicité
    const existing = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } })
    if (existing) {
      return NextResponse.json({ error: "Ce code existe déjà" }, { status: 400 })
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        discountPercent: discountPercent ? Number(discountPercent) : null,
        discountAmount: discountAmount ? Number(discountAmount) : null,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: Number(maxUses) || 100,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      }
    })

    return NextResponse.json(promo)

  } catch (error) {
    console.error("[PROMO_CREATE]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// GET — Lister tous les codes promo
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error("[PROMO_LIST]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
