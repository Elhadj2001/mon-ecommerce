import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth"
import { logger } from "@/lib/logger"

// Endpoint destructeur : nécessite admin + token de confirmation explicite.
// Refuse de s'exécuter en production sans flag explicite ALLOW_RESET_DB=true.
export async function POST(req: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_RESET_DB !== 'true') {
    return NextResponse.json(
      { error: "reset-db désactivé en production (ALLOW_RESET_DB requis)" },
      { status: 403 },
    )
  }

  let body: { confirm?: string } = {}
  try {
    body = await req.json()
  } catch {
    /* body vide */
  }

  if (body.confirm !== 'RESET') {
    return NextResponse.json(
      { error: "Confirmation manquante : envoyez { confirm: 'RESET' } dans le body" },
      { status: 400 },
    )
  }

  try {
    const result = await prisma.$transaction([
      prisma.orderItem.deleteMany({}),
      prisma.order.deleteMany({}),
      prisma.image.deleteMany({}),
      prisma.review.deleteMany({}),
      prisma.product.deleteMany({}),
      prisma.category.deleteMany({}),
    ])

    logger.warn(`[RESET_DB] Admin ${admin.userId} a réinitialisé la BDD`, {
      orderItems: result[0].count,
      orders: result[1].count,
      images: result[2].count,
      reviews: result[3].count,
      products: result[4].count,
      categories: result[5].count,
    })

    return NextResponse.json({
      message: "Base de données nettoyée avec succès",
      deleted: {
        orderItems: result[0].count,
        orders: result[1].count,
        images: result[2].count,
        reviews: result[3].count,
        products: result[4].count,
        categories: result[5].count,
      },
    })
  } catch (error) {
    logger.error("[RESET_ERROR]", error)
    return NextResponse.json({ error: "Erreur lors du nettoyage" }, { status: 500 })
  }
}
