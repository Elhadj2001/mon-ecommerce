import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()

    // On cherche un code promo actif (et non expiré, ou sans date d'expiration)
    // On priorise celui avec le plus grand discountPercent, puis discountAmount
    const activePromos = await prisma.promoCode.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: [
        { discountPercent: 'desc' },
        { discountAmount: 'desc' }
      ]
    })

    // On filtre ensuite pour s'assurer qu'il n'a pas atteint maxUses
    const bestPromo = activePromos.find(promo => promo.usedCount < promo.maxUses)

    if (!bestPromo) {
      return NextResponse.json(null)
    }

    return NextResponse.json(bestPromo)
  } catch (error) {
    console.error("[PROMO_ACTIVE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
