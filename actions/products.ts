'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { productSchema, ProductFormValues } from '@/lib/validations/product'

export interface GetProductsParams {
  categoryId?: string
  isFeatured?: boolean
  gender?: string
  search?: string
  take?: number
  sizes?: string[]
  colors?: string[]
}

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const { categoryId, isFeatured, gender, search, take, sizes, colors } = params

    const whereClause: any = {
      isArchived: false,
    }

    if (categoryId) whereClause.categoryId = categoryId
    if (isFeatured !== undefined) whereClause.isFeatured = isFeatured
    if (gender) whereClause.gender = gender

    if (sizes && sizes.length > 0) {
      whereClause.sizes = { hasSome: sizes }
    }

    if (colors && colors.length > 0) {
      whereClause.colors = { hasSome: colors }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } }
      ]
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: take || undefined
    })

    return products
  } catch (error) {
    console.error("[GET_PRODUCTS]", error)
    throw new Error("Erreur lors de la récupération des produits")
  }
}

export async function getProduct(id: string) {
  try {
    if (!id) return null

    const product = await prisma.product.findUnique({
      where: {
        id,
        isArchived: false
      },
      include: {
        images: true,
        category: true,
      }
    })

    return product
  } catch (error) {
    console.error("[GET_PRODUCT]", error)
    return null
  }
}

export async function createProduct(formData: ProductFormValues) {
  try {
    // 1. Validation de sécurité Zod côté serveur
    const validatedData = productSchema.parse(formData)

    if (validatedData.images.length === 0) {
      throw new Error("Au moins une image est requise")
    }

    await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice || null,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        gender: validatedData.gender,
        isFeatured: validatedData.isFeatured,
        isArchived: validatedData.isArchived,
        sizes: validatedData.sizes,
        colors: validatedData.colors,
        images: {
          create: validatedData.images.map((img: any) => ({
            url: img.url,
            color: img.color || null
          }))
        }
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/')
    
  } catch (error) {
    console.error('Erreur création produit:', error)
    throw new Error("Données invalides")
  }
  
  redirect('/admin/products')
}

export async function updateProduct(productId: string, formData: ProductFormValues) {
  try {
    // 1. Validation de sécurité Zod côté serveur
    const validatedData = productSchema.parse(formData)

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        originalPrice: validatedData.originalPrice || null,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        gender: validatedData.gender, 
        isFeatured: validatedData.isFeatured,
        isArchived: validatedData.isArchived,
        sizes: validatedData.sizes,
        colors: validatedData.colors,
      }
    })

    await prisma.image.deleteMany({
      where: { productId: productId }
    })

    if (validatedData.images && validatedData.images.length > 0) {
      await prisma.image.createMany({
        data: validatedData.images.map((img: any) => ({
          productId: productId,
          url: img.url,
          color: img.color || null
        }))
      })
    }

    revalidatePath('/admin/products')
    revalidatePath('/')
    
  } catch (error) {
    console.error('Erreur modification produit:', error)
    throw new Error("Données invalides")
  }
  
  redirect('/admin/products')
}

export async function deleteProduct(formData: FormData) {
  const productId = formData.get('productId') as string

  if (!productId) return

  try {
    await prisma.product.delete({
      where: { id: productId }
    })

    revalidatePath('/admin/products')
  } catch (error) {
    console.error('Erreur suppression produit:', error)
    throw new Error("Erreur serveur")
  }
}