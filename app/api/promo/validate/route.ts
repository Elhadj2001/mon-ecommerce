import { NextResponse } from 'next/server'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { promoValidateSchema } from '@/lib/validations/promo'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, { key: 'promo-validate', limit: 20, windowSeconds: 60 })
    if (!limit.allowed) return limit.response!

    const parsed = promoValidateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Code promo requis', issues: z.flattenError(parsed.error) },
        { status: 400 },
      )
    }
    const { code, subtotal } = parsed.data

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!promo) {
      return NextResponse.json({ error: "Code promo invalide" }, { status: 404 })
    }
    if (!promo.isActive) {
      return NextResponse.json({ error: "Ce code promo n'est plus actif" }, { status: 400 })
    }
    if (promo.expiresAt && new Date() > promo.expiresAt) {
      return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 })
    }
    if (promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ error: "Ce code promo a atteint son nombre maximum d'utilisations" }, { status: 400 })
    }
    if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
      return NextResponse.json({
        error: `Commande minimum de ${Number(promo.minOrderAmount)} EUR requise`,
      }, { status: 400 })
    }

    let discountEur = 0
    if (promo.discountPercent) {
      discountEur = (subtotal * promo.discountPercent) / 100
    } else if (promo.discountAmount) {
      discountEur = Number(promo.discountAmount)
    }
    discountEur = Math.min(discountEur, subtotal)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount: promo.discountAmount ? Number(promo.discountAmount) : null,
      discountEur: Math.round(discountEur * 100) / 100,
      message: promo.discountPercent
        ? `-${promo.discountPercent}% appliqué !`
        : `Réduction appliquée !`,
    })
  } catch (error) {
    console.error("[PROMO_VALIDATE]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
