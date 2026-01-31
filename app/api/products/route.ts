import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      name, price, stock, categoryId, images, sizes, colors, description, isFeatured, isArchived 
    } = body

    // 1. Validation stricte
    if (!name || !price || !categoryId || !images || !images.length) {
      return new NextResponse("Données manquantes ou invalides", { status: 400 })
    }

    // 2. Gestion intelligente de la catégorie
    let finalCategoryId = categoryId

    // On vérifie si categoryId est un UUID (ID technique) ou un simple nom
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId)

    if (!isUUID) {
      // Si ce n'est pas un ID, on cherche par NOM
      const existingCategory = await prisma.category.findFirst({
        where: { name: { equals: categoryId, mode: 'insensitive' } }
      })

      if (existingCategory) {
        finalCategoryId = existingCategory.id
      } else {
        // Sinon on la crée proprement avant le produit
        const newCategory = await prisma.category.create({
          data: { name: categoryId }
        })
        finalCategoryId = newCategory.id
      }
    }

    // 3. Création du produit avec l'ID maintenant GARANTI
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
        categoryId: finalCategoryId, // L'ID qui existe forcément
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