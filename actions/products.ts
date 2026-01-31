'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Définition du type attendu pour une image lors de la création
// Ce n'est plus juste un string, mais un objet { url, color }
export interface ProductImageInput {
  url: string
  color?: string // Optionnel (pour les images générales)
}

// On définit le type des données du formulaire
interface ProductFormValues {
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: ProductImageInput[] // Changement ici : tableau d'objets
  sizes: string[]
  colors: string[]
  isFeatured: boolean
}

export async function createProduct(formData: ProductFormValues) {
  try {
    // Validation basique
    if (!formData.name || !formData.price || !formData.categoryId || formData.images.length === 0) {
      throw new Error("Champs obligatoires manquants")
    }

    await prisma.product.create({
      data: {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        isFeatured: formData.isFeatured,
        sizes: formData.sizes,
        colors: formData.colors,
        // MAGIE ICI : On crée les images dans la table Image en même temps
        images: {
          create: formData.images.map((img) => ({
            url: img.url,
            color: img.color || null // Si pas de couleur, on met null
          }))
        }
      }
    })

    revalidatePath('/admin/products')
    revalidatePath('/')
    
  } catch (error) {
    console.error('Erreur création produit:', error)
    // On ne retourne pas d'erreur pour l'instant pour simplifier, 
    // mais dans l'idéal on renverrait un state d'erreur
  }
  
  redirect('/admin/products')
}

export async function updateProduct(productId: string, formData: ProductFormValues) {
  try {
    // 1. Mise à jour des infos simples du produit
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        categoryId: formData.categoryId,
        isFeatured: formData.isFeatured,
        sizes: formData.sizes,
        colors: formData.colors,
      }
    })

    // 2. Gestion des Images (La méthode "Brutale mais Sûre")
    // Pour éviter de comparer quelles images ont changé, on supprime tout et on recrée.
    // C'est rapide et ça évite les bugs de synchronisation.
    
    // A. On supprime les anciennes images
    await prisma.image.deleteMany({
      where: { productId: productId }
    })

    // B. On recrée les nouvelles
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