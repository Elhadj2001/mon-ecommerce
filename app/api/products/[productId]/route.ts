import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cette fonction gère la mise à jour (PATCH) d'un produit
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params
    const body = await req.json()
    
    // On récupère la nouvelle valeur du stock depuis le corps de la requête
    const { stock } = body

    // Vérification de sécurité de base
    if (!productId) {
      return new NextResponse("Product ID requis", { status: 400 })
    }

    // Mise à jour dans la Base de Données
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        // On convertit en entier pour être sûr (le frontend envoie parfois des strings)
        stock: parseInt(stock) 
      }
    })

    return NextResponse.json(updatedProduct)

  } catch (error) {
    console.log('[PRODUCT_PATCH]', error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
}