import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); 
    
    const body = await req.json()
    const { 
      name, price, originalPrice, stock, categoryId, 
      images, sizes, colors, description, 
      isFeatured, isArchived, gender 
    } = body

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!name || !price || !categoryId || !images || !images.length) {
      return new NextResponse("Données manquantes", { status: 400 })
    }

    // Gestion intelligente de la catégorie (Simplifiée sans storeId)
    let finalCategoryId = categoryId
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

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock),
        description: description || "",
        isFeatured: !!isFeatured,
        isArchived: !!isArchived,
        gender: gender || "Unisexe",
        sizes: sizes || [],
        colors: colors || [],
        
        // On connecte la catégorie
        category: {
            connect: { id: finalCategoryId }
        },
        // ❌ PLUS DE STORE ICI
        
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
    return new NextResponse("Erreur création", { status: 500 })
  }
}