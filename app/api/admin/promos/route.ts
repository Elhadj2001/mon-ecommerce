import { NextResponse } from 'next/server'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { promoCreateSchema } from '@/lib/validations/promo'

// POST — Créer un nouveau code promo
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const parsed = promoCreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation', issues: z.flattenError(parsed.error) },
        { status: 400 },
      )
    }
    const { code, discountPercent, discountAmount, minOrderAmount, maxUses, expiresAt } = parsed.data
    const normalizedCode = code.toUpperCase().trim()

    const existing = await prisma.promoCode.findUnique({ where: { code: normalizedCode } })
    if (existing) {
      return NextResponse.json({ error: "Ce code existe déjà" }, { status: 409 })
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: normalizedCode,
        discountPercent: discountPercent ?? null,
        discountAmount: discountAmount ?? null,
        minOrderAmount: minOrderAmount ?? null,
        maxUses,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
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
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(promos)
  } catch (error) {
    console.error("[PROMO_LIST]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
