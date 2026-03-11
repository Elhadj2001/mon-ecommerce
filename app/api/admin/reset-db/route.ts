import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Cette route supprime tout SAUF l'admin et les catégories (optionnel)
export async function GET(req: Request) {
  try {
    // 1. D'abord les éléments dépendants (les enfants)
    // On supprime les articles des commandes
    await prisma.orderItem.deleteMany({})
    console.log("✅ OrderItems supprimés")

    // 2. Ensuite les commandes elles-mêmes
    await prisma.order.deleteMany({})
    console.log("✅ Commandes supprimées")

    // 3. Les images des produits (liées aux produits)
    await prisma.image.deleteMany({})
    console.log("✅ Images supprimées")

    // 4. Les produits eux-mêmes
    await prisma.product.deleteMany({})
    console.log("✅ Produits supprimés")
    
    // --- OPTIONNEL : DÉCOMMENTEZ SI VOUS VOULEZ AUSSI SUPPRIMER LES CATÉGORIES ---
    await prisma.category.deleteMany({})
    console.log("✅ Catégories supprimées")

    // ATTENTION : NE JAMAIS METTRE prisma.user.deleteMany() SINON VOUS PERDEZ VOTRE COMPTE

    return NextResponse.json({ message: "Base de données nettoyée avec succès (Commandes & Produits)" })

  } catch (error) {
    console.error("[RESET_ERROR]", error)
    return new NextResponse("Erreur lors du nettoyage", { status: 500 })
  }
}