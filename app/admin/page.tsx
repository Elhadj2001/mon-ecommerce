import { prisma } from '@/lib/prisma'
import Overview from '@/components/admin/Overview'
import ExportButton from '@/components/admin/ExportButton'
import Link from 'next/link'
import { Activity, CreditCard, DollarSign, Package, ShoppingCart } from 'lucide-react' // On ajoute des icônes jolies

const formatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
})

export default async function AdminDashboardPage() {
  // 1. CHARGEMENT DES DONNÉES
  const [paidOrders, pendingOrdersCount, productsCount, allProducts] = await Promise.all([
    // A. Commandes PAYÉES
    prisma.order.findMany({
      where: { isPaid: true },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    // B. Commandes EN ATTENTE (Nouveau !)
    prisma.order.count({
      where: { isPaid: false }
    }),
    // C. Nombre total de produits
    prisma.product.count(),
    // D. Tous les produits (pour stock et récents)
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
  ])

  // --- CALCULS ---
  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity)
    }, 0)
    return total + orderTotal
  }, 0)

  const salesCount = paidOrders.length
  
  // Valeur Stock
  const stockValue = allProducts.reduce((acc, item) => {
    return acc + (Number(item.price) * item.stock)
  }, 0)

  // Graphique
  const graphData: Record<string, number> = {}
  for (const order of paidOrders) {
    const month = order.createdAt.toLocaleDateString("fr-FR", { month: "short" })
    const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + (Number(item.product.price) * item.quantity)
    }, 0)
    graphData[month] = (graphData[month] || 0) + orderTotal
  }
  const chartData = Object.entries(graphData).map(([name, total]) => ({ name, total }))

  const recentProducts = allProducts.slice(0, 5)

  return (
    <div className="space-y-8">
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex gap-2">
            <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                + Ajouter Produit
            </Link>
            <ExportButton />
        </div>
      </div>

      {/* --- LES 5 CARTES VITALES --- */}
      {/* On passe en grid-cols-5 pour tout aligner si l'écran est grand */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        
        {/* 1. REVENU */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">Revenu</h3>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
        </div>

        {/* 2. VENTES VALIDÉES */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">Ventes</h3>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">+{salesCount}</div>
          <p className="text-xs text-green-600 font-medium">Commandes payées</p>
        </div>

        {/* 3. EN ATTENTE (La nouvelle carte !) */}
        <div className="rounded-xl border bg-white p-6 shadow-sm border-l-4 border-l-orange-400">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">En attente</h3>
            <Activity className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{pendingOrdersCount}</div>
          <p className="text-xs text-orange-600 font-medium">Paniers abandonnés ?</p>
        </div>

        {/* 4. PRODUITS */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">Catalogue</h3>
            <Package className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold">{productsCount}</div>
          <p className="text-xs text-gray-500">Produits en ligne</p>
        </div>

        {/* 5. VALEUR STOCK */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium text-gray-500">Stock</h3>
            <ShoppingCart className="h-4 w-4 text-gray-500" />
          </div>
          <div className="text-2xl font-bold truncate" title={formatter.format(stockValue)}>
            {formatter.format(stockValue)}
          </div>
        </div>

      </div>

      {/* --- GRAPHIQUE & TABLEAU --- */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-7">
        <div className="md:col-span-4 rounded-xl border bg-white shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-4">Analyse des ventes</h3>
            <Overview data={chartData} />
          </div>
        </div>

        <div className="md:col-span-3 rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gray-50">
             <h3 className="font-semibold text-lg">Derniers ajouts</h3>
          </div>
          <div className="p-0">
             <table className="w-full text-sm text-left">
                <tbody>
                    {recentProducts.map((product) => (
                        <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="p-4 font-medium truncate max-w-[150px]">{product.name}</td>
                            <td className="p-4 text-gray-500 text-right">{Number(product.price).toFixed(2)} €</td>
                            <td className="p-4 text-right">
                                {product.stock > 0 ? (
                                    <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded-full">{product.stock} dispo</span>
                                ) : (
                                    <span className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full">Rupture</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             <div className="p-4 border-t text-center">
                <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">
                    Gérer inventaire →
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}