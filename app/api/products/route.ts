import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      name, 
      price, 
      stock, 
      categoryId, 
      images, 
      sizes, 
      colors, 
      description, 
      isFeatured, 
      isArchived,
      gender // <--- RÉCUPÉRATION DU CHAMP GENRE
    } = body

    // 1. Validation stricte
    if (!name || !price || !categoryId || !images || !images.length) {
      return new NextResponse("Données manquantes ou invalides", { status: 400 })
    }

    // 2. Gestion intelligente de la catégorie
    let finalCategoryId = categoryId

    // On vérifie si categoryId est un UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)

    if (!isUUID) {
      const existingCategory = await prisma.category.findFirst({
        where: { name: { equals: categoryId, mode: 'insensitive' } }
      })

      if (existingCategory) {
        finalCategoryId = existingCategory.id
      } else {
        const newCategory = await prisma.category.create({
          data: { name: categoryId }
        })
        finalCategoryId = newCategory.id
      }
    }

    // 3. Création du produit
    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        description,
        isFeatured: !!isFeatured,
        isArchived: !!isArchived,
        sizes,
        colors,
        // ENREGISTREMENT DU GENRE
        // Si non défini, on met 'Unisex' par défaut pour éviter les bugs
        gender: gender || "Unisex", 
        categoryId: finalCategoryId,
        images: {
          createMany: {
            data: images.map((image: { url: string; color?: string }) => ({
              url: image.url,
              color: image.color || null
            }))
          }
        }
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse("Erreur lors de la création du produit", { status: 500 })
  }
}