import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"
import { Prisma } from "@prisma/client"

interface ProductsPageProps {
  searchParams: { 
    sort?: string       // 'new', 'price_asc', 'price_desc'
    isPromo?: string    // 'true'
    gender?: string     // 'Homme', 'Femme'
    categoryId?: string // Pour filtrer par catégorie spécifique
    search?: string     // Pour la barre de recherche
  }
}

// Note: Dans Next.js 15, searchParams est une Promise. 
// Dans Next.js 13/14, c'est un objet direct.
// Ce code est compatible avec les deux approches.
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // On sécurise les params (si c'est une promise ou non)
  const params = await searchParams;
  
  // 1. INITIALISATION DU FILTRE
  const whereClause: Prisma.ProductWhereInput = {
    isArchived: false, // Toujours cacher les archives
  }

  // --- GESTION DES FILTRES ---

  // A. Filtre RECHERCHE (Barre de recherche)
  if (params.search) {
    whereClause.name = {
      contains: params.search,
      mode: 'insensitive' // Ignore majuscules/minuscules
    }
  }

  // B. Filtre PROMO : Uniquement si demandé
  if (params.isPromo === 'true') {
    whereClause.originalPrice = { not: null }
  }

  // C. Filtre GENRE (Homme / Femme)
  // ATTENTION : Cela suppose que tu as une colonne 'gender' dans ton modèle Product.
  // Si tu utilises des catégories pour le genre, il faut changer cette ligne.
  if (params.gender) {
    whereClause.gender = params.gender 
  }

  // D. Filtre CATÉGORIE (Si on clique sur une catégorie précise)
  if (params.categoryId) {
    whereClause.categoryId = params.categoryId
  }

  // --- GESTION DU TRI ---
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' } // Par défaut : Nouveautés

  if (params.sort === 'price_asc') {
    orderBy = { price: 'asc' }
  } else if (params.sort === 'price_desc') {
    orderBy = { price: 'desc' }
  } else if (params.sort === 'new') {
    orderBy = { createdAt: 'desc' }
  }

  // 3. RÉCUPÉRATION VIA PRISMA
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { images: true },
    orderBy: orderBy
  })

  // 4. TITRE DYNAMIQUE
  let title = "Tous nos produits"
  if (params.search) title = `Résultats pour "${params.search}"`
  else if (params.isPromo === 'true') title = "Nos Promotions"
  else if (params.sort === 'new') title = "Nouveautés"
  else if (params.gender) title = `Collection ${params.gender}`

  return (
    <div className="min-h-screen bg-background text-foreground pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* EN-TÊTE DE LA PAGE */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-border pb-6 mb-12 gap-4">
            <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-tight">
                {title}
            </h1>
            <span className="text-sm font-bold uppercase tracking-widest text-[#c9a84c] whitespace-nowrap">
                {products.length} pièce{products.length > 1 ? 's' : ''}
            </span>
        </div>

        {/* GRILLE DE PRODUITS */}
        {products.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/30 rounded-xl border border-border">
             <div className="text-4xl mb-4 opacity-50">✦</div>
             <p className="font-bold text-lg uppercase tracking-widest">Aucune pièce trouvée.</p>
             <p className="text-muted-foreground text-sm mt-3">L&apos;exclusivité demande de la patience, essayez d&apos;autres filtres.</p>
           </div>
        ) : (
           // CORRECTION GRILLE : grid-cols-2 sur mobile (comme Shein)
           <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
             {products.map((product) => (
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
        )}
      </div>
    </div>
  )
}