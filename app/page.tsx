import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard' // Assure-toi que le fichier est bien là
import Link from 'next/link'

export const revalidate = 0 

export default async function Home() {
  // 1. On récupère les catégories AVEC leurs produits ET images
  const categories = await prisma.category.findMany({
    include: {
      products: {
        take: 4, 
        orderBy: { createdAt: 'desc' },
        include: {
           images: true // <--- OBLIGATOIRE pour avoir l'image
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  // On filtre pour ne garder que les catégories non vides
  const activeCategories = categories.filter(cat => cat.products.length > 0)

  return (
    <main className="min-h-screen bg-white">
      
      {/* SECTION HERO */}
      <div className="relative overflow-hidden bg-gray-50">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:static sm:px-6 lg:px-8">
            <div className="sm:max-w-lg">
              <h1 className="font text-4xl font-black tracking-tighter text-gray-900 sm:text-6xl uppercase">
                Nouvelle Collection
              </h1>
              <p className="mt-4 text-xl text-gray-500 font-light">
                Elégance sans compromis. Découvrez nos pièces uniques conçues pour durer.
              </p>
              <div className="mt-10">
                <a href="#collection" className="inline-block rounded-none bg-black px-8 py-3 text-center font-bold text-white uppercase tracking-widest hover:bg-gray-800 transition">
                  Voir la boutique
                </a>
              </div>
            </div>
            
            <div className="mt-10 mb-10 md:absolute md:right-0 md:top-0 md:mt-20 md:w-1/2 lg:mt-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                 src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" 
                 alt="Hero" 
                 className="rounded-none shadow-none object-cover h-64 w-full md:h-96 grayscale hover:grayscale-0 transition duration-700"
               />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION PAR CATÉGORIE */}
      <div id="collection" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
        
        {activeCategories.map((category) => (
          <section key={category.id}>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-black tracking-tighter text-gray-900 uppercase">
                {category.name}
              </h2>
              <Link 
                href={`/category/${category.id}`} 
                className="text-sm font-bold text-gray-500 hover:text-black uppercase tracking-widest transition-colors"
              >
                Voir tout →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {category.products.map((product) => (
                // Dans app/page.tsx

              <ProductCard 
                key={product.id} 
                data={{
                  ...product, // <--- C'EST LA CLÉ ! Cela passe description, stock, etc.
                  price: product.price.toNumber(), // On écrase juste le prix pour le convertir
                  // Pas besoin de redéfinir sizes/colors/images ici car ...product les contient déjà
                  // sauf si tu veux forcer des valeurs par défaut
                }} 
              />
              ))}
            </div>
          </section>
        ))}

        {activeCategories.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Aucun produit en ligne pour le moment.</p>
            <p className="text-sm text-gray-400 mt-2">Connectez-vous à admin pour ajouter vos collections.</p>
          </div>
        )}

      </div>
    </main>
  )
}