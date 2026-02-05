import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'

export const revalidate = 0 

export default async function Home() {
  // 1. Récupérer les Nouveautés
  const newArrivals = await prisma.product.findMany({
    take: 8,
    where: { isArchived: false },
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  })

  // 2. Récupérer les Promotions
  // NOTE : Prisma ne permet pas de faire "where originalPrice > price" directement.
  // On récupère donc les candidats potentiels (ceux qui ont un prix d'origine non null)
  const potentialPromotions = await prisma.product.findMany({
    take: 20, // On en prend un peu plus pour filtrer après
    where: { 
      isArchived: false,
      originalPrice: { not: null } 
    },
    include: { images: true }
  })

  // FILTRE JAVASCRIPT : On ne garde que les VRAIES promos (Ancien Prix > Nouveau Prix)
  const promotions = potentialPromotions.filter(product => {
     return product.originalPrice && product.originalPrice.toNumber() > product.price.toNumber()
  }).slice(0, 8) // On garde les 8 meilleurs

  // 3. Récupérer les catégories
  const categories = await prisma.category.findMany({
    include: {
      products: {
        take: 4, 
        where: { isArchived: false },
        orderBy: { createdAt: 'desc' },
        include: { images: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  const activeCategories = categories.filter(cat => cat.products.length > 0)

  const ProductCarousel = ({ title, products, subtitle }: { title: string, products: any[], subtitle?: string }) => (
    <section className="space-y-4">
      <div className="flex items-end justify-between px-4 sm:px-0">
        <div>
            <h2 className="text-xl font-black tracking-tighter text-gray-900 uppercase sm:text-3xl">{title}</h2>
            {subtitle && <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{subtitle}</p>}
        </div>
      </div>
      
      <div className="relative">
        <div className="flex w-full gap-3 overflow-x-auto pb-4 pt-2 scrollbar-hide snap-x snap-mandatory px-4 sm:px-0">
          {products.map((product) => (
            <div key={product.id} className="min-w-[40%] sm:min-w-[28%] md:min-w-[22%] lg:min-w-[18%] snap-start">
              <ProductCard 
                data={{
                  ...product,
                  price: product.price.toNumber(),
                  originalPrice: product.originalPrice ? product.originalPrice.toNumber() : null
                }} 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )

  return (
    <main className="min-h-screen bg-white">
      {/* SECTION HERO */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 sm:text-6xl uppercase">
                Nouvelle Collection
              </h1>
              <p className="mt-4 text-xl text-gray-500 font-light">
                Élégance sans compromis. Découvrez nos pièces uniques conçues pour durer.
              </p>
              <div className="mt-10">
                <a href="#collection" className="inline-block bg-black px-8 py-4 text-center font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition">
                  Voir la boutique
                </a>
              </div>
            </div>
            
            <div className="mt-10 mb-10 md:absolute md:right-0 md:top-0 md:mt-20 md:w-1/2 lg:mt-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" 
                 alt="Hero" 
                 className="h-64 w-full md:h-[500px] grayscale hover:grayscale-0 transition duration-700 object-cover"
               />
            </div>
          </div>
        </div>
      </div>

      <div id="collection" className="mx-auto max-w-7xl py-16 space-y-24">
        
        {/* 1. CAROUSEL NOUVEAUTÉS */}
        {newArrivals.length > 0 && (
            <ProductCarousel 
                title="Nouveautés" 
                subtitle="Derniers arrivages"
                products={newArrivals} 
            />
        )}

        {/* 2. CAROUSEL PROMOTIONS */}
        {promotions.length > 0 && (
            <ProductCarousel 
                title="Offres Spéciales" 
                subtitle="Nos meilleures réductions"
                products={promotions} 
            />
        )}

        {/* 3. GRILLES PAR CATÉGORIES */}
        {activeCategories.map((category) => (
          <section key={category.id} className="px-4 sm:px-0">
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
                {category.name}
              </h2>
              <Link 
                href={`/category/${category.id}`} 
                className="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-widest"
              >
                Voir tout →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-y-10 gap-x-4 md:grid-cols-3 lg:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  data={{
                    ...product,
                    price: product.price.toNumber(),
                    originalPrice: product.originalPrice ? product.originalPrice.toNumber() : null
                  }} 
                />
              ))}
            </div>
          </section>
        ))}

      </div>
    </main>
  )
}