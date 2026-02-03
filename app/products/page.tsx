import { prisma } from "@/lib/prisma"
import ProductCard from "@/components/ProductCard"

// Cette page reçoit les paramètres d'URL (ex: ?isPromo=true&gender=Homme)
export default async function ProductsPage({
  searchParams
}: {
  searchParams: { 
    sort?: string;      // 'new', 'price_asc', 'price_desc'
    isPromo?: string;   // 'true'
    gender?: string;    // 'Homme', 'Femme'
  }
}) {
  // AWAIT les searchParams (Obligatoire dans les versions récentes de Next.js)
  const params = await searchParams;
  
  // 1. Construction du filtre (Where clause)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    isArchived: false, // On cache les archives
  }

  // Filtre PROMO : Si ?isPromo=true, on cherche les produits qui ont un prix barré
  if (params.isPromo === 'true') {
    whereClause.originalPrice = { not: null }
  }

  // Filtre GENRE : Si ?gender=Homme
  if (params.gender) {
    whereClause.gender = params.gender
  }

  // 2. Gestion du Tri
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: 'desc' } // Par défaut : Nouveautés

  if (params.sort === 'price_asc') {
    orderBy = { price: 'asc' }
  } else if (params.sort === 'price_desc') {
    orderBy = { price: 'desc' }
  }

  // 3. Récupération via Prisma
  const products = await prisma.product.findMany({
    where: whereClause,
    include: { images: true },
    orderBy: orderBy
  })

  // 4. Titre dynamique
  let title = "Tous nos produits"
  if (params.isPromo === 'true') title = "Nos Promotions"
  else if (params.sort === 'new' || !params.sort) title = "Nouveautés"

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* En-tête de la page */}
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 mb-10">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
                {title}
                {params.gender && <span className="text-gray-400 ml-2">· {params.gender}</span>}
            </h1>
             <span className="text-sm text-gray-500 font-medium">{products.length} articles</span>
        </div>

        {/* Grille de produits */}
        {products.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-lg">
             <p className="text-gray-500 text-lg">Aucun produit ne correspond à ces critères pour le moment.</p>
           </div>
        ) : (
           <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {products.map((product) => (
               // On utilise @ts-ignore pour convertir rapidement les types Decimal Prisma -> Number
               // @ts-ignore
               <ProductCard key={product.id} data={{
                   ...product, 
                   price: product.price.toNumber(),
                   originalPrice: product.originalPrice ? product.originalPrice.toNumber() : null
               }} />
             ))}
           </div>
        )}
      </div>
    </div>
  )
}