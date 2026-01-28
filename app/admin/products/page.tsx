import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProduct } from '@/actions/products'
import AdminToolbar from '@/components/admin/AdminToolbar'
import Pagination from '@/components/admin/Pagination'
import StockForm from '@/components/admin/StockForm'
import { Category, Product } from '@prisma/client'

// On définit le type attendu pour un produit avec sa catégorie incluse
type ProductWithCategory = Product & {
  category: Category
}

interface AdminProductsPageProps {
  searchParams: Promise<{
    query?: string
    categoryId?: string
    page?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams
  const query = params.query || ''
  const categoryId = params.categoryId || ''
  const currentPage = Number(params.page) || 1
  const itemsPerPage = 7

  const whereCondition = {
    AND: [
      { name: { contains: query, mode: 'insensitive' as const } },
      categoryId ? { categoryId } : {}
    ]
  }

  // Typage explicite des résultats pour éviter le "any"
  const [totalItems, products, categories]: [number, ProductWithCategory[], Category[]] = await Promise.all([
    prisma.product.count({ where: whereCondition }),
    prisma.product.findMany({
      where: whereCondition,
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } })
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

      <AdminToolbar categories={categories} />

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table sans espaces blancs entre les balises pour éviter l'erreur d'hydration */}
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b uppercase tracking-wider text-xs font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Catégorie</th>
                <th className="px-6 py-4">Prix</th>
                <th className="px-6 py-4">Gestion Stock</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
                      <img 
                        src={product.images[0] || '/placeholder.png'} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
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
                    <div className="scale-90 origin-left"> 
                      <StockForm 
                        productId={product.id} 
                        initialStock={product.stock} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <form action={deleteProduct}>
                      <input type="hidden" name="productId" value={product.id} />
                      <button className="text-gray-400 hover:text-red-600 font-medium transition-colors text-xs uppercase tracking-wide cursor-pointer">
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

      <Pagination totalPages={totalPages} />
    </div>
  )
}