import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import { notFound } from "next/navigation"

export const revalidate = 0

// 1. On ajoute 'gender' et 'sort' aux paramètres attendus
interface CategoryPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    color?: string
    size?: string
    gender?: string // <-- AJOUT CRUCIAL
    sort?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Résolution des promesses (Next.js 15)
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const categoryId = resolvedParams.id;
  const gender = resolvedSearchParams.gender; // ex: "Homme" ou "Femme"

  if (!categoryId) {
    return notFound();
  }

  // 2. Construction du filtre dynamique
  // On prépare l'objet 'where' pour les produits
  const productsWhereClause: any = {
    isArchived: false
  }

  // Si un genre est présent dans l'URL, on l'ajoute au filtre
  if (gender) {
    productsWhereClause.gender = gender; 
  }

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId
    },
    include: {
      products: {
        // 3. Application du filtre ici
        where: productsWhereClause,
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
        
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-6 mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                    {category.name}
                </h1>
                {/* 4. Feedback visuel pour l'utilisateur */}
                {gender && (
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-2">
                        Collection {gender}
                    </p>
                )}
            </div>
            
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                {category.products.length} résultat{category.products.length > 1 ? 's' : ''}
            </span>
        </div>

        {category.products.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-lg">
             <p className="text-gray-900 font-medium text-lg">Aucun produit trouvé.</p>
             <p className="text-gray-500 text-sm mt-2">
                Essayez de changer de collection ou revenez plus tard.
             </p>
             {gender && (
                <a href={`/category/${categoryId}`} className="mt-4 text-black underline text-sm font-bold">
                    Voir tous les produits {category.name} (Homme & Femme)
                </a>
             )}
           </div>
        ) : (
           <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
             {category.products.map((product) => (
               <ProductCard 
                 key={product.id} 
                 data={{
                   ...product,
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