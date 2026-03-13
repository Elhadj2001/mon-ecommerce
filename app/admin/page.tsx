import { prisma } from '@/lib/prisma'
import Overview from '@/components/admin/Overview'
import ExportButton from '@/components/admin/ExportButton'
import Link from 'next/link'
import {
  Activity, CreditCard, TrendingUp, Package,
  ShoppingCart, ArrowUpRight, Plus, AlertTriangle
} from 'lucide-react'
import { formatPrice, convertToXof } from '@/lib/currency'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [paidOrders, pendingOrdersCount, productsCount, allProducts, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { isPaid: true },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.order.count({ where: { isPaid: false } }),
    prisma.product.count({ where: { isArchived: false } }),
    prisma.product.findMany({ orderBy: { createdAt: 'desc' }, where: { isArchived: false } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { orderItems: { include: { product: true } } }
    })
  ])

  const totalRevenueEUR = paidOrders.reduce((total, order) =>
    total + order.orderItems.reduce((sum, item) =>
      sum + (Number(item.product.price) * item.quantity), 0), 0)

  const salesCount = paidOrders.length
  const stockValueEUR = allProducts.reduce((acc, item) => acc + (Number(item.price) * item.stock), 0)
  const outOfStockCount = allProducts.filter(p => p.stock === 0).length
  const criticalStockCount = allProducts.filter(p => p.stock > 0 && p.stock <= 3).length

  const graphData: Record<string, number> = {}
  for (const order of paidOrders) {
    const month = order.createdAt.toLocaleDateString("fr-FR", { month: "short" })
    const orderTotalXOF = convertToXof(order.orderItems.reduce((sum, item) =>
      sum + (Number(item.product.price) * item.quantity), 0))
    graphData[month] = (graphData[month] || 0) + orderTotalXOF
  }
  const chartData = Object.entries(graphData).map(([name, total]) => ({ name, total }))

  const kpis = [
    {
      label: 'Chiffre d\'affaires',
      value: formatPrice(totalRevenueEUR),
      icon: TrendingUp,
      sub: `${salesCount} commande${salesCount > 1 ? 's' : ''} payée${salesCount > 1 ? 's' : ''}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-100 dark:border-emerald-800/30',
    },
    {
      label: 'En attente',
      value: pendingOrdersCount,
      icon: Activity,
      sub: 'Paniers non validés',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800/30',
    },
    {
      label: 'Catalogue actif',
      value: productsCount,
      icon: Package,
      sub: `${outOfStockCount} en rupture de stock`,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-100 dark:border-violet-800/30',
    },
    {
      label: 'Valeur du stock',
      value: formatPrice(stockValueEUR),
      icon: ShoppingCart,
      sub: `${criticalStockCount} produit${criticalStockCount > 1 ? 's' : ''} stock critique`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800/30',
    },
    {
      label: 'Commandes totales',
      value: paidOrders.length + pendingOrdersCount,
      icon: CreditCard,
      sub: 'Depuis le lancement',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-100 dark:border-rose-800/30',
    },
  ]

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── En-tête ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Bienvenue, ici le résumé de <span className="font-semibold text-foreground">Maison Niang</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#09090b] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#f0d080] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Produit
          </Link>
          <ExportButton />
        </div>
      </div>

      {/* ── Alerte stock critique (si besoin) ── */}
      {(outOfStockCount > 0 || criticalStockCount > 0) && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            {outOfStockCount > 0 && <><strong>{outOfStockCount} produit{outOfStockCount > 1 ? 's' : ''}</strong> en rupture de stock. </>}
            {criticalStockCount > 0 && <><strong>{criticalStockCount} produit{criticalStockCount > 1 ? 's' : ''}</strong> avec un stock critique (≤ 3).</>}
            {' '}<Link href="/admin/products" className="underline font-bold">Gérer le stock →</Link>
          </p>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className={`relative bg-card border ${kpi.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden`}
            >
              {/* Glow décoratif */}
              <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${kpi.bg} opacity-50 blur-xl`} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {kpi.label}
                  </p>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                </div>
                <p
                  className="text-2xl font-black text-foreground truncate"
                  title={String(kpi.value)}
                >
                  {kpi.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1.5">{kpi.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Graphique & Tables ── */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">

        {/* Graphique ventes */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-black text-foreground text-sm uppercase tracking-wide">
                Analyse des ventes
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">En FCFA par mois</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#c9a84c]" />
              <span className="text-[10px] text-muted-foreground font-medium">Revenu mensuel</span>
            </div>
          </div>
          <div className="p-6">
            <Overview data={chartData} />
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-black text-foreground text-sm uppercase tracking-wide">
                Commandes récentes
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">5 dernières</p>
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-[10px] font-bold text-[#c9a84c] hover:text-foreground transition-colors"
            >
              Voir tout <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune commande</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {recentOrders.map((order) => {
                    const total = order.orderItems.reduce(
                      (s, i) => s + Number(i.product.price) * i.quantity, 0)
                    return (
                      <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                        <td className="px-5 py-3">
                          <p className="font-mono text-xs font-bold text-foreground">
                            #{order.id.substring(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {order.createdAt.toLocaleDateString('fr-FR')}
                          </p>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <p className="text-xs font-bold text-foreground">{formatPrice(total)}</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider mt-0.5 inline-block ${
                            order.isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          }`}>
                            {order.isPaid ? 'Payé' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ── Produits récents ── */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="font-black text-foreground text-sm uppercase tracking-wide">
              Derniers produits ajoutés
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">5 plus récents</p>
          </div>
          <Link
            href="/admin/products"
            className="flex items-center gap-1 text-[10px] font-bold text-[#c9a84c] hover:text-foreground transition-colors"
          >
            Gérer <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Produit</th>
                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prix</th>
                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stock</th>
                <th className="text-right px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-foreground truncate max-w-[200px]">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{product.gender}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-foreground text-xs">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {product.stock === 0 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20 font-bold">
                        Rupture
                      </span>
                    ) : product.stock <= 3 ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full border border-amber-200 dark:border-amber-700/40 font-bold">
                        ⚠ {product.stock} restant{product.stock > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-700/30 font-bold">
                        {product.stock} dispo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-[10px] font-bold text-muted-foreground hover:text-[#c9a84c] transition-colors uppercase tracking-wider"
                    >
                      Modifier →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}