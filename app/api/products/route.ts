import { NextResponse } from 'next/server'
import * as z from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import { productSchema } from '@/lib/validations/product'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 24))
    const categoryId = searchParams.get('categoryId') || undefined
    const isFeatured = searchParams.get('isFeatured')
    const gender = searchParams.get('gender') || undefined
    const q = searchParams.get('q')?.trim() || undefined

    const where = {
      isArchived: false,
      ...(categoryId ? { categoryId } : {}),
      ...(isFeatured === 'true' ? { isFeatured: true } : {}),
      ...(gender ? { gender } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { description: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [total, items] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { images: true, category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('[PRODUCTS_GET]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const json = await req.json()
    const parsed = productSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation', issues: z.flattenError(parsed.error) },
        { status: 400 },
      )
    }

    const {
      name, price, originalPrice, stock, categoryId,
      images, sizes, colors, description,
      isFeatured, isArchived, gender,
    } = parsed.data
    const isFreeShipping = (json as { isFreeShipping?: boolean }).isFreeShipping ?? false

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
        isFreeShipping: !!isFreeShipping,
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
            data: images.map((image) => ({
              url: image.url,
              color: image.color ?? null,
            }))
          }
        }
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('[PRODUCTS_POST]', error)
    return new NextResponse("Erreur création", { status: 500 })
  }
}