import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import Link from 'next/link'
import Image from 'next/image' // On importe Image pour optimiser si possible

// On désactive le cache pour voir les modifications instantanément
export const revalidate = 0 

export default async function Home() {
  // 1. Récupération des catégories non vides avec leurs produits et images
  const categories = await prisma.category.findMany({
    include: {
      products: {
        take: 4, // On affiche les 4 derniers produits par catégorie
        orderBy: { createdAt: 'desc' },
        include: {
          images: true // INDISPENSABLE pour que la ProductCard affiche la photo
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // 2. Filtrage : on ne garde que les catégories qui ont des produits
  const activeCategories = categories.filter(cat => cat.products.length > 0)

  return (
    <main className="min-h-screen bg-white">
      
      {/* --- SECTION HERO (Bannière) --- */}
      <div className="relative bg-gray-50">
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
          
          {/* Texte Hero */}
          <div className="px-6 pb-24 pt-10 sm:pb-32 lg:col-span-7 lg:px-0 lg:pb-56 lg:pt-48 xl:col-span-6">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 sm:text-6xl uppercase">
                Nouvelle Collection
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 font-light">
                Une élégance sans compromis. Découvrez nos pièces uniques conçues pour durer et sublimer votre quotidien.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="#collection"
                  className="rounded-none bg-black px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black uppercase tracking-widest transition-all"
                >
                  Voir la boutique
                </a>
              </div>
            </div>
          </div>

          {/* Image Hero */}
          <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
            {/* J'utilise une simple balise img ici pour éviter les soucis de config Next/Image pour l'instant */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="aspect-[3/2] w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80"
              alt="Nouvelle Collection Fashion"
            />
          </div>
        </div>
      </div>

      {/* --- SECTION PRODUITS PAR CATÉGORIE --- */}
      <div id="collection" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-24">
        
        {activeCategories.map((category) => (
          <section key={category.id}>
            
            {/* En-tête de catégorie */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
                {category.name}
              </h2>
              <Link 
                href={`/category/${category.id}`} 
                className="hidden sm:block text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors"
              >
                Voir tout →
              </Link>
            </div>

            {/* --- LA GRILLE MAGIQUE (Mobile: 2 colonnes / PC: 4 colonnes) --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-8">
              {category.products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  data={{
                    ...product,
                    // Conversion du Decimal Prisma en Number pour le JS
                    price: product.price.toNumber() 
                  }} 
                />
              ))}
            </div>

            {/* Bouton "Voir tout" pour mobile (en bas de liste) */}
            <div className="mt-8 sm:hidden text-center">
                 <Link 
                href={`/category/${category.id}`} 
                className="text-xs font-bold text-gray-500 hover:text-black uppercase tracking-widest border-b border-gray-300 pb-1"
              >
                Voir toute la collection {category.name}
              </Link>
            </div>

          </section>
        ))}

        {/* Message si vide */}
        {activeCategories.length === 0 && (
          <div className="text-center py-32 bg-gray-50 rounded-xl">
            <p className="text-gray-500 text-lg font-medium">La boutique est en cours de préparation.</p>
            <p className="text-sm text-gray-400 mt-2">Revenez très vite !</p>
          </div>
        )}

      </div>
    </main>
  )
}