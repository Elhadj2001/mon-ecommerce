import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductInfo from '@/components/product/ProductInfo'
import ProductGallery from '@/components/product/ProductGallery'
import ProductCard from '@/components/ProductCard'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  
  // 1. On récupère le produit principal
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    }
  })

  if (!product) {
    return notFound()
  }

  // 2. CORRECTION DES TYPES ICI 👇
  // On transforme les données brutes de la DB pour qu'elles collent au Frontend
  const formattedProduct = {
    ...product,
    price: product.price.toNumber(),
    
    // Si 'sizes' est null, on renvoie un tableau vide [].
    // Si c'est du texte "S,M,L", on le coupe en tableau ["S", "M", "L"].
    sizes: product.sizes ? product.sizes.split(',') : [],
    
    // Pareil pour 'colors'
    colors: product.colors ? product.colors.split(',') : [],
    
    // 'images' est déjà un tableau dans ton schema (String[]), donc c'est bon.
    // Mais par sécurité, si jamais c'est vide/null, on force un tableau vide.
    images: product.images || []
  }

  // 3. Produits similaires
  const suggestedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: {
        id: product.id 
      }
    },
    take: 4,
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* SECTION PRINCIPALE */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          <ProductGallery images={product.images} />
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            {/* TypeScript est content car formattedProduct a maintenant des tableaux ! */}
            <ProductInfo product={formattedProduct} />
          </div>
        </div>

        {/* SECTION PRODUITS SIMILAIRES */}
        {suggestedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-8">
              Vous aimerez aussi
            </h2>
            
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {suggestedProducts.map((relatedProduct) => (
                <ProductCard 
                  key={relatedProduct.id} 
                  data={{
                    ...relatedProduct,
                    price: relatedProduct.price.toNumber()
                  }} 
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}