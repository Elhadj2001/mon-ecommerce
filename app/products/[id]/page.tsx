import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductInfo from '@/components/product/ProductInfo'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  // 1. On attend la résolution des paramètres (Next.js 15)
  const { id } = await params

  // 2. On cherche le produit via Prisma
  const product = await prisma.product.findUnique({
    where: { id: id },
  })

  // 3. Gestion 404
  if (!product) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Fil d'ariane */}
        <Link 
          href="/" 
          className="mb-8 inline-block text-xs font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors"
        >
          ← Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Colonne Gauche : Image (Reste statique côté serveur) */}
          <div className="overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] relative">
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Colonne Droite : Infos (Composant Client Interactif) */}
          <div>
            <ProductInfo 
              product={{
                ...product,
                price: product.price.toNumber() // Conversion obligatoire du Decimal
              }} 
            />
          </div>
        </div>

      </div>
    </div>
  )
}