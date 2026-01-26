'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = formData.get('price') as string
  const stock = formData.get('stock') as string
  const imageUrl = formData.get('imageUrl') as string
  const categoryName = formData.get('category') as string

  // Nouveaux champs
  const gender = formData.get('gender') as string || "Unisexe"
  const sizes = formData.get('sizes') as string
  const colors = formData.get('colors') as string
  
  // --- CORRECTION ICI : On déclare la variable avant de l'utiliser ---
  const isFeatured = formData.get('isFeatured') === 'on' 

  if (!name || !price || !categoryName || !imageUrl) {
    return
  }

  // 1. Gestion Catégorie
  let category = await prisma.category.findFirst({
    where: { name: categoryName }
  })

  if (!category) {
    category = await prisma.category.create({
      data: { name: categoryName }
    })
  }

  // 2. Création Produit
  await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      images: [imageUrl],
      categoryId: category.id,
      gender,
      sizes,
      colors,
      isFeatured // Maintenant la variable existe, l'erreur va disparaître
    }
  })

  revalidatePath('/admin/products')
  revalidatePath('/') 
  redirect('/admin/products')
}

// Fonction de suppression (inchangée mais nécessaire dans le fichier)
export async function deleteProduct(formData: FormData) {
  const productId = formData.get('productId') as string
  if (!productId) return
  try {
    await prisma.product.delete({ where: { id: productId } })
    revalidatePath('/admin/products')
  } catch (error) {
    console.error("Erreur suppression:", error)
  }
}