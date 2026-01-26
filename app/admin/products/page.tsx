import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProduct } from '@/actions/products'
import AdminToolbar from '@/components/admin/AdminToolbar' // Import du nouveau composant
import Pagination from '@/components/admin/Pagination'     // Import de la pagination

// On définit ce que la page peut recevoir comme paramètres URL (?query=...&page=...)
interface AdminProductsPageProps {
  searchParams: Promise<{
    query?: string
    categoryId?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  // 1. On récupère les paramètres de l'URL
  const params = await searchParams
  const query = params.query || ''
  const categoryId = params.categoryId || ''
  const currentPage = Number(params.page) || 1
  const itemsPerPage = 7 // Nombre de produits par page

  // 2. On prépare les filtres pour Prisma
  // Cette logique permet de chercher par nom ET/OU par catégorie
  const whereCondition = {
    AND: [
      // Filtre texte (insensible à la casse)
      { name: { contains: query, mode: 'insensitive' as const } },
      // Filtre catégorie (seulement si une catégorie est sélectionnée)
      categoryId ? { categoryId } : {}
    ]
  }

  // 3. On fait deux requêtes en parallèle (Performance)
  // - totalItems : Pour savoir combien de pages il y a
  // - products : Les produits de la page actuelle seulement
  const [totalItems, products, categories] = await Promise.all([
    prisma.product.count({ where: whereCondition }),
    prisma.product.findMany({
      where: whereCondition,
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage, // L'astuce mathématique de la pagination
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }) // Pour le menu déroulant
  ])

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestion Stock</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition shadow-lg">
          + Nouveau Produit
        </Link>
      </div>

      {/* --- NOTRE NOUVELLE BARRE D'OUTILS --- */}
      <AdminToolbar categories={categories} />

      {/* --- TABLEAU (Légèrement retouché) --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b uppercase tracking-wider text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                      {product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">{Number(product.price).toFixed(2)} €</td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Rupture</span>
                    ) : (
                      <span className={`font-medium ${product.stock < 5 ? 'text-orange-600' : 'text-green-600'}`}>
                        {product.stock} en stock
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button className="text-gray-400 hover:text-red-600 font-medium transition-colors text-xs uppercase tracking-wide">
                        Supprimer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {products.length === 0 && (
           <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <p className="text-lg font-medium">Aucun résultat</p>
             <p className="text-sm">Essayez de modifier votre recherche ou vos filtres.</p>
           </div>
        )}
      </div>

      {/* --- NOTRE PAGINATION --- */}
      <Pagination totalPages={totalPages} />
    </div>
  )
}