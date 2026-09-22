import { NextResponse } from 'next/server'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { reviewSchema } from '@/lib/validations/review'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const limit = await rateLimit(req, { key: 'reviews', limit: 5, windowSeconds: 60 })
    if (!limit.allowed) return limit.response!

    const session = await requireAuth()
    if (!session.ok) return session.response

    const json = await req.json()
    const parsed = reviewSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation', issues: z.flattenError(parsed.error) },
        { status: 400 },
      )
    }
    const { productId, rating, comment, authorName } = parsed.data

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    })
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    // Atomicité via la contrainte unique @@unique([productId, clerkUserId]).
    // Note: après `prisma generate`, on peut basculer sur prisma.review.upsert()
    // avec where: { productId_clerkUserId: { productId, clerkUserId } }.
    const review = await prisma.$transaction(async (tx) => {
      const existing = await tx.review.findFirst({
        where: { productId, clerkUserId: session.userId },
        select: { id: true },
      })
      if (existing) {
        return tx.review.update({
          where: { id: existing.id },
          data: { authorName, rating, comment, isApproved: false },
        })
      }
      return tx.review.create({
        data: {
          productId,
          clerkUserId: session.userId,
          authorName,
          rating,
          comment,
          isApproved: false,
        },
      })
    })

    return NextResponse.json({
      review,
      message: "Avis soumis (en attente de modération)",
    })
  } catch (error) {
    console.error("[REVIEW_CREATE]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// GET — Récupérer les avis approuvés d'un produit
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: "productId requis" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({ reviews, avgRating, totalReviews: reviews.length })
  } catch (error) {
    console.error("[REVIEW_GET]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
