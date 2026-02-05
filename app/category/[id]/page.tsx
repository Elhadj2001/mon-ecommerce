import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import { notFound } from "next/navigation"

export const revalidate = 0

// Interface mise à jour pour Next.js 15
interface CategoryPageProps {
  params: Promise<{
    id: string // Correspond au nom du dossier [id]
  }>
  searchParams: Promise<{
    color?: string
    size?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // 1. On attend la résolution des promesses (Obligatoire en Next.js 15)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categoryId = resolvedParams.id;

  // 2. Vérification de l'ID pour éviter l'erreur Prisma "needs at least one of id arguments"
  if (!categoryId) {
    return notFound();
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    },
    include: {
      products: {
        where: {
          isArchived: false
          // Vous pourriez ajouter ici les filtres de couleur/taille si besoin
          // en utilisant resolvedSearchParams.color ou size
        },
        include: {
          images: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  })

  if (!category) {
    return notFound()
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                {category.name}
            </h1>
            <span className="text-sm text-gray-500 font-medium">
                {category.products.length} résultat{category.products.length > 1 ? 's' : ''}
            </span>
        </div>

        {category.products.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <p className="text-gray-500">Aucun produit dans cette catégorie.</p>
           </div>
        ) : (
           <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
             {category.products.map((product) => (
               <ProductCard 
                 key={product.id} 
                 data={{
                   ...product,
                   // Conversion Decimal -> Number pour le composant Client ProductCard
                   price: Number(product.price),
                   originalPrice: product.originalPrice ? Number(product.originalPrice) : null
                 }} 
               />
             ))}
           </div>
        )}
      </div>
    </div>
  )
}