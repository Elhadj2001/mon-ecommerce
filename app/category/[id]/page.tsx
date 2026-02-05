import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import { notFound } from "next/navigation"

export const revalidate = 0

interface CategoryPageProps {
  params: {
    categoryId: string
  }
  searchParams: {
    color?: string
    size?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Pour Next.js 15, il faudrait await params, mais pour 13/14 c'est direct
  // const resolvedParams = await params; 
  
  const category = await prisma.category.findUnique({
    where: {
      id: params.categoryId
    },
    include: {
      products: {
        where: {
          isArchived: false
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
                    // CORRECTION ICI : Conversion explicite Decimal -> Number
                    price: product.price.toNumber(),
                    originalPrice: product.originalPrice ? product.originalPrice.toNumber() : null
                 }} 
               />
             ))}
           </div>
        )}
      </div>
    </div>
  )
}