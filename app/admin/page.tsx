import { prisma } from '@/lib/prisma'
import Overview from '@/components/admin/Overview'
import ExportButton from '@/components/admin/ExportButton'
import Link from 'next/link'
import { Activity, CreditCard, TrendingUp, Package, ShoppingCart, ArrowUpRight, Plus } from 'lucide-react'
import { formatPrice, convertToXof } from '@/lib/currency'

export default async function AdminDashboardPage() {
  const [paidOrders, pendingOrdersCount, productsCount, allProducts] = await Promise.all([
    prisma.order.findMany({
      where: { isPaid: true },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.order.count({ where: { isPaid: false } }),
    prisma.product.count({ where: { isArchived: false } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' }, where: { isArchived: false } })
  ])

  const totalRevenueEUR = paidOrders.reduce((total, order) => {
    return total + order.orderItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)
  }, 0)

  const salesCount = paidOrders.length
  const stockValueEUR = allProducts.reduce((acc, item) => acc + (Number(item.price) * item.stock), 0)
  const outOfStockCount = allProducts.filter(p => p.stock === 0).length

  const graphData: Record<string, number> = {}
  for (const order of paidOrders) {
    const month = order.createdAt.toLocaleDateString("fr-FR", { month: "short" })
    const orderTotalXOF = convertToXof(order.orderItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0))
    graphData[month] = (graphData[month] || 0) + orderTotalXOF
  }
  const chartData = Object.entries(graphData).map(([name, total]) => ({ name, total }))
  const recentProducts = allProducts.slice(0, 5)

  const kpis = [
    { label: 'Revenu Global', value: formatPrice(totalRevenueEUR), icon: TrendingUp, sub: 'Commandes payées', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Ventes', value: `+${salesCount}`, icon: CreditCard, sub: 'Commandes validées', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'En attente', value: pendingOrdersCount, icon: Activity, sub: 'Paniers ouverts', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Catalogue', value: productsCount, icon: Package, sub: `${outOfStockCount} en rupture`, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { label: 'Valeur Stock', value: formatPrice(stockValueEUR), icon: ShoppingCart, sub: 'Estimation totale', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
  ]

  return (
    <div className="space-y-8">
      
      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground mt-1">Bienvenue dans votre espace d'administration</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-bold hover:bg-foreground/90 transition"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </Link>
          <ExportButton />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground truncate" title={String(kpi.value)}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Graphique & Derniers produits */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-7">
        <div className="md:col-span-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="p-6 border-b border-border">
            <h3 className="font-black text-foreground uppercase tracking-wide text-sm">Analyse des ventes (FCFA)</h3>
          </div>
          <div className="p-6">
            <Overview data={chartData} />
          </div>
        </div>

        <div className="md:col-span-3 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-black text-foreground uppercase tracking-wide text-sm">Derniers produits</h3>
            <Link href="/admin/products" className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition">
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <table className="w-full text-sm">
              <tbody>
                {recentProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition">
                    <td className="px-5 py-3 font-semibold text-foreground truncate max-w-[140px]">{product.name}</td>
                    <td className="px-5 py-3 text-muted-foreground text-right">{formatPrice(product.price)}</td>
                    <td className="px-5 py-3 text-right">
                      {product.stock > 0 ? (
                        <span className="text-emerald-600 text-xs bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-700">{product.stock} dispo</span>
                      ) : (
                        <span className="text-destructive text-xs bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">Rupture</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}