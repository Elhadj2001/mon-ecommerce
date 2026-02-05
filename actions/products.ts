'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface ProductImageInput {
  url: string
  color?: string
}

// 1. AJOUT DES CHAMPS MANQUANTS DANS L'INTERFACE
interface ProductFormValues {
  name: string
  description: string
  price: number
  originalPrice?: number | null // <--- AJOUTÉ
  stock: number
  categoryId: string
  gender: string // <--- AJOUTÉ (Important pour tes filtres)
  images: ProductImageInput[]
  sizes: string[]
  colors: string[]
  isFeatured: boolean
}

export async function createProduct(formData: ProductFormValues) {
  try {
    if (!formData.name || !formData.price || !formData.categoryId || formData.images.length === 0) {
      throw new Error("Champs obligatoires manquants")
    }

    await prisma.product.create({
      data: {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        // 2. SAUVEGARDE DU PRIX PROMO
        originalPrice: formData.originalPrice || null,
        stock: formData.stock,
        categoryId: formData.categoryId,
        // 3. SAUVEGARDE DU GENRE
        gender: formData.gender || "Unisexe",
        isFeatured: formData.isFeatured,
        sizes: formData.sizes,
        colors: formData.colors,
        images: {
          create: formData.images.map((img) => ({
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
  }
  
  redirect('/admin/products')
}

export async function updateProduct(productId: string, formData: ProductFormValues) {
  try {
    // 1. Mise à jour des infos simples
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        // 4. MISE À JOUR DU PRIX PROMO
        originalPrice: formData.originalPrice || null,
        stock: formData.stock,
        categoryId: formData.categoryId,
        // 5. MISE À JOUR DU GENRE
        gender: formData.gender, 
        isFeatured: formData.isFeatured,
        sizes: formData.sizes,
        colors: formData.colors,
      }
    })

    // 2. Gestion des Images (Suppression + Recréation)
    await prisma.image.deleteMany({
      where: { productId: productId }
    })

    if (formData.images && formData.images.length > 0) {
      await prisma.image.createMany({
        data: formData.images.map((img) => ({
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
  }
}