import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

// DELETE — Supprimer un code promo
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { promoId } = await params

    await prisma.promoCode.delete({
      where: { id: promoId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PROMO_DELETE]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// PATCH — Activer/Désactiver un code promo
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ promoId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { promoId } = await params
    const body = await req.json()

    const promo = await prisma.promoCode.update({
      where: { id: promoId },
      data: { isActive: body.isActive }
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error("[PROMO_TOGGLE]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
