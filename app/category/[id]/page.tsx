import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { id } = await params
  const { gender } = await searchParams
  const genderFilter = typeof gender === 'string' ? gender : undefined

  // 1. REQUÊTE INTELLIGENTE : On cherche quels genres existent VRAIMENT dans cette catégorie
  // On utilise "distinct" pour ne pas récupérer 1000 fois "Homme"
  const distinctGenders = await prisma.product.findMany({
    where: { categoryId: id },
    select: { gender: true },
    distinct: ['gender']
  })

  // On transforme le résultat en un tableau simple (ex: ['Homme', 'Femme'])
  const availableGenders = distinctGenders.map(g => g.gender)

  // 2. On récupère la catégorie et les produits filtrés
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        where: {
          gender: genderFilter 
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!category) return notFound()

  // Fonction de style pour les boutons
  const getFilterStyle = (currentFilter: string | undefined) => {
    const isActive = genderFilter === currentFilter
    return `px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
      isActive 
        ? 'bg-black text-white border-black' 
        : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
    }`
  }

  // Ordre d'affichage souhaité pour les boutons
  const order = ['Homme', 'Femme', 'Enfant', 'Unisexe']
  
  // On trie les genres disponibles selon notre ordre préféré
  const sortedGenders = order.filter(g => availableGenders.includes(g))

  return (
    <div className="bg-white min-h-screen">
      
      {/* EN-TÊTE */}
      <div className="bg-gray-50 border-b mb-8">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">
            {category.name}
          </h1>
          <p className="mt-2 text-xs text-gray-500 tracking-[0.2em] uppercase">
            {category.products.length} articles affichés
          </p>
        </div>
      </div>

      {/* --- BARRE DE FILTRES DYNAMIQUE --- */}
      {/* On n'affiche la barre que s'il y a au moins 2 choix de genre différents */}
      {availableGenders.length > 1 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {/* Bouton "Tout" toujours visible si on filtre */}
            <Link href={`/category/${id}`} className={getFilterStyle(undefined)}>
              Tout
            </Link>
            
            {/* On génère SEULEMENT les boutons des genres qui existent */}
            {sortedGenders.map((g) => (
              <Link key={g} href={`/category/${id}?gender=${g}`} className={getFilterStyle(g)}>
                {g}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* GRILLE PRODUITS */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24">
        {category.products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-lg font-medium">Aucun article ne correspond à ce filtre.</p>
            {genderFilter && (
               <Link href={`/category/${id}`} className="mt-4 inline-block text-sm text-black underline underline-offset-4">
                 Voir toute la collection
               </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {category.products.map((product) => (
              <ProductCard 
                key={product.id} 
                data={{
                  ...product,
                  price: product.price.toNumber()
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}