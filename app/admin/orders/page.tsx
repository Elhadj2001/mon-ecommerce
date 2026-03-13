import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/currency'
import OrderStatusSelect from '@/components/admin/OrderStatusSelect'
import { Phone, MapPin, Mail, User, Search, Download } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PAYMENT_LABELS: Record<string, { label: string; emoji: string }> = {
  WAVE: { label: 'Wave', emoji: '🌊' },
  ORANGE_MONEY: { label: 'Orange Money', emoji: '🟠' },
  CASH_ON_DELIVERY: { label: 'Livraison', emoji: '💵' },
  PAYPAL: { label: 'PayPal', emoji: '💳' },
}

const STATUS_FILTERS = [
  { value: '', label: 'Toutes', color: '' },
  { value: 'PENDING', label: 'En attente', color: 'text-yellow-600 border-yellow-200' },
  { value: 'PAYMENT_RECEIVED', label: 'Paiement reçu', color: 'text-blue-600 border-blue-200' },
  { value: 'PROCESSING', label: 'En préparation', color: 'text-indigo-600 border-indigo-200' },
  { value: 'SHIPPED', label: 'Expédiées', color: 'text-purple-600 border-purple-200' },
  { value: 'DELIVERED', label: 'Livrées', color: 'text-green-600 border-green-200' },
  { value: 'CANCELLED', label: 'Annulées', color: 'text-red-600 border-red-200' },
]

interface AdminOrdersPageProps {
  searchParams: Promise<{
    q?: string
    status?: string
  }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams
  const searchQuery = params.q || ''
  const statusFilter = params.status || ''

  const whereCondition = {
    AND: [
      searchQuery ? {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' as const } },
          { phone: { contains: searchQuery } },
          { email: { contains: searchQuery, mode: 'insensitive' as const } },
          { id: { contains: searchQuery, mode: 'insensitive' as const } },
        ]
      } : {},
      statusFilter ? { status: statusFilter as 'PENDING' | 'PAYMENT_RECEIVED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' } : {},
    ]
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { product: true }
        }
      },
      take: 50
    }),
    prisma.order.count()
  ])

  // Compteurs par statut
  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  })
  const getStatusCount = (status: string) => {
    const found = statusCounts.find(s => s.status === status)
    return found ? found._count : 0
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Commandes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{totalCount} commande(s) au total</p>
        </div>
        <a
          href="/api/admin/orders/export"
          className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>
      </div>

      {/* Barre de recherche */}
      <form className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Rechercher par nom, téléphone, email, numéro de commande..."
          className="w-full pl-11 pr-4 py-3 bg-card text-foreground text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] transition-all placeholder:text-muted-foreground"
        />
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
      </form>

      {/* Filtres par statut */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.value ? getStatusCount(filter.value) : totalCount
          const isActive = statusFilter === filter.value
          return (
            <Link
              key={filter.value}
              href={`/admin/orders${filter.value ? `?status=${filter.value}` : ''}${searchQuery ? `${filter.value ? '&' : '?'}q=${searchQuery}` : ''}`}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                isActive
                  ? 'bg-foreground text-background border-foreground'
                  : `bg-card text-muted-foreground border-border hover:text-foreground ${filter.color}`
              }`}
            >
              {filter.label} ({count})
            </Link>
          )
        })}
      </div>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          Aucune commande correspondante.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const subtotal = order.orderItems.reduce(
              (acc, item) => acc + Number(item.product.price) * item.quantity, 0
            )
            const shippingCost = Number(order.shippingCost || 0)
            const discount = Number(order.discount || 0)
            const total = subtotal + shippingCost - discount
            const payment = PAYMENT_LABELS[order.paymentMethod] || { label: order.paymentMethod, emoji: '💳' }

            return (
              <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">

                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-secondary/40 border-b border-border">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Ref.</p>
                      <p className="font-black text-foreground text-sm tracking-widest font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total</p>
                      <p className="text-sm font-black text-foreground">{formatPrice(total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Paiement</p>
                      <p className="text-sm font-medium text-foreground">{payment.emoji} {payment.label}</p>
                    </div>
                    {order.promoCode && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Promo</p>
                        <p className="text-sm font-bold text-green-600">{order.promoCode}</p>
                      </div>
                    )}
                  </div>

                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                </div>

                {/* Client */}
                <div className="px-6 py-3 bg-secondary/20 border-b border-border flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  {order.name && (
                    <span className="inline-flex items-center gap-1">
                      <User className="w-3 h-3" /> <strong className="text-foreground">{order.name}</strong>
                    </span>
                  )}
                  {order.phone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.phone}
                    </span>
                  )}
                  {order.email && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {order.email}
                    </span>
                  )}
                  {order.address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {order.address}
                    </span>
                  )}
                </div>

                {/* Articles */}
                <div className="px-6 py-3">
                  <div className="flex flex-col gap-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-2 text-sm">
                        <span className="font-bold text-foreground whitespace-nowrap">{item.quantity} ×</span>
                        <div>
                          <span className="font-medium text-foreground">{item.product.name}</span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {item.size && (
                              <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                                T: <strong className="text-foreground">{item.size}</strong>
                              </span>
                            )}
                            {item.color && (
                              <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="ml-auto text-sm font-bold text-foreground whitespace-nowrap">
                          {formatPrice(Number(item.product.price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Détail livraison/réduction si applicable */}
                  {(shippingCost > 0 || discount > 0) && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs text-muted-foreground">
                      {shippingCost > 0 && (
                        <div className="flex justify-between">
                          <span>Frais de livraison</span>
                          <span className="font-bold text-foreground">{formatPrice(shippingCost)}</span>
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-600">Réduction</span>
                          <span className="font-bold text-green-600">-{formatPrice(discount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}