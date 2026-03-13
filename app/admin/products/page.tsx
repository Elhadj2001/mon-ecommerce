import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { deleteProduct } from '@/actions/products'
import AdminToolbar from '@/components/admin/AdminToolbar'
import Pagination from '@/components/admin/Pagination'
import StockForm from '@/components/admin/StockForm'
import { Category, Product, Image as ProductImage } from '@prisma/client'
import { formatPrice } from '@/lib/currency'
import { Plus, AlertTriangle, Package } from 'lucide-react'

type ProductWithRelations = Product & {
  category: Category;
  images: ProductImage[];
}

interface AdminProductsPageProps {
  searchParams: Promise<{
    query?: string
    categoryId?: string
    page?: string
    stock?: string // Filtre stock : "rupture", "critique", ""
  }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams
  const query = params.query || ''
  const categoryId = params.categoryId || ''
  const stockFilter = params.stock || ''
  const currentPage = Number(params.page) || 1
  const itemsPerPage = 10

  // Filtre stock
  const stockCondition = stockFilter === 'rupture'
    ? { stock: 0 }
    : stockFilter === 'critique'
    ? { stock: { gt: 0, lte: 3 } }
    : {}

  const whereCondition = {
    AND: [
      { name: { contains: query, mode: 'insensitive' as const } },
      categoryId ? { categoryId } : {},
      { isArchived: false },
      stockCondition,
    ]
  }

  const [totalItems, products, categories, outOfStockCount, criticalCount]: [number, ProductWithRelations[], Category[], number, number] = await Promise.all([
    prisma.product.count({ where: whereCondition }),
    prisma.product.findMany({
      where: whereCondition,
      take: itemsPerPage,
      skip: (currentPage - 1) * itemsPerPage,
      orderBy: [
        { stock: 'asc' }, // Rupture et critique en haut
        { createdAt: 'desc' }
      ],
      include: {
        category: true,
        images: true
      }
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.count({ where: { isArchived: false, stock: 0 } }),
    prisma.product.count({ where: { isArchived: false, stock: { gt: 0, lte: 3 } } }),
  ])

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Gestion du catalogue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalItems} produit{totalItems > 1 ? 's' : ''} actif{totalItems > 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#09090b] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#f0d080] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau Produit
        </Link>
      </div>

      {/* Alertes stock */}
      {(outOfStockCount > 0 || criticalCount > 0) && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">
            {outOfStockCount > 0 && <><strong>{outOfStockCount} produit{outOfStockCount > 1 ? 's' : ''}</strong> en rupture de stock. </>}
            {criticalCount > 0 && <><strong>{criticalCount} produit{criticalCount > 1 ? 's' : ''}</strong> avec un stock critique (≤ 3). </>}
          </p>
        </div>
      )}

      {/* Filtres stock rapides */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/products"
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${!stockFilter ? 'bg-foreground text-background border-foreground' : 'bg-card text-muted-foreground border-border hover:text-foreground'}`}
        >
          Tous
        </Link>
        <Link
          href="/admin/products?stock=rupture"
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${stockFilter === 'rupture' ? 'bg-red-600 text-white border-red-600' : 'bg-card text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
        >
          🚨 Rupture ({outOfStockCount})
        </Link>
        <Link
          href="/admin/products?stock=critique"
          className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${stockFilter === 'critique' ? 'bg-amber-600 text-white border-amber-600' : 'bg-card text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
        >
          ⚠ Critique ({criticalCount})
        </Link>
      </div>

      {/* Toolbar de recherche/catégorie existante */}
      <AdminToolbar categories={categories} />

      {/* Table des produits */}
      <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-secondary/30 border-b border-border uppercase tracking-wider text-xs font-bold text-muted-foreground">
              <tr>
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Nom</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Prix</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const isOutOfStock = product.stock === 0
                const isCritical = product.stock > 0 && product.stock <= 3

                return (
                  <tr
                    key={product.id}
                    className={`transition-colors ${
                      isOutOfStock
                        ? 'bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500'
                        : isCritical
                        ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-4 border-l-amber-500'
                        : 'hover:bg-secondary/30 border-l-4 border-l-transparent'
                    }`}
                  >
                    <td className="px-6 py-3">
                      <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.images?.[0]?.url || '/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <p className="font-bold text-foreground truncate max-w-[200px]">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{product.gender}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-foreground border border-border">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-foreground text-xs">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-white bg-red-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                            RUPTURE
                          </span>
                        ) : isCritical ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700 font-bold">
                            ⚠ {product.stock} restant{product.stock > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-700 font-bold">
                            {product.stock} dispo
                          </span>
                        )}
                        <div className="scale-90 origin-left">
                          <StockForm
                            productId={product.id}
                            initialStock={product.stock}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-[10px] font-bold text-muted-foreground hover:text-[#c9a84c] transition-colors uppercase tracking-wider"
                        >
                          Modifier
                        </Link>
                        <form action={deleteProduct}>
                          <input type="hidden" name="productId" value={product.id} />
                          <button className="text-muted-foreground hover:text-red-600 font-bold transition-colors text-[10px] uppercase tracking-wide cursor-pointer">
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="py-16 text-center flex flex-col items-center">
            <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-bold text-muted-foreground">Aucun résultat</p>
            <p className="text-xs text-muted-foreground mt-1">Essayez de modifier votre recherche ou vos filtres.</p>
          </div>
        )}
      </div>

      <Pagination totalPages={totalPages} />
    </div>
  )
}