import { ProductForm } from "@/components/admin/ProductForm"
import { prisma } from "@/lib/prisma"

export default async function NewProductPage() {
  // 1. On récupère les catégories depuis la base de données
  // Cela permet de remplir le menu déroulant du formulaire
  const categories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  })

  // 2. On affiche le composant intelligent ProductForm
  // On passe "initialData={null}" car c'est une CRÉATION (le formulaire sera vide)
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm categories={categories} initialData={null} />
      </div>
    </div>
  );
}