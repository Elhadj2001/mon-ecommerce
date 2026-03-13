import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Connectez-vous pour laisser un avis" }, { status: 401 })
    }

    const { productId, rating, comment, authorName } = await req.json()

    if (!productId || !rating || !comment || !authorName) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 })
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })
    }

    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = await prisma.review.findFirst({
      where: { productId, clerkUserId: userId }
    })

    if (existingReview) {
      // Mettre à jour l'avis existant
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment, authorName, isApproved: false }
      })
      return NextResponse.json({ review: updated, message: "Avis mis à jour (en attente de modération)" })
    }

    // Créer un nouvel avis
    const review = await prisma.review.create({
      data: {
        productId,
        clerkUserId: userId,
        authorName,
        rating,
        comment,
        isApproved: false // Par défaut, en attente de modération
      }
    })

    return NextResponse.json({ review, message: "Avis soumis (en attente de modération)" })

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
      take: 20
    })

    // Calcul de la note moyenne
    const avgRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({ reviews, avgRating, totalReviews: reviews.length })

  } catch (error) {
    console.error("[REVIEW_GET]", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
