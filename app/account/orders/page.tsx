import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/currency"
import { Package, CheckCircle, Clock, Truck, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING:          { label: "En attente de paiement", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  PAYMENT_RECEIVED: { label: "Paiement reçu",          color: "text-blue-600 bg-blue-50 border-blue-200",   icon: CreditCard },
  PROCESSING:       { label: "En préparation",          color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: Package },
  SHIPPED:          { label: "Expédiée",                color: "text-purple-600 bg-purple-50 border-purple-200", icon: Truck },
  DELIVERED:        { label: "Livrée",                   color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  CANCELLED:        { label: "Annulée",                 color: "text-red-600 bg-red-50 border-red-200",     icon: Clock },
}

const PAYMENT_LABELS: Record<string, string> = {
  WAVE: '🌊 Wave',
  ORANGE_MONEY: '🟠 Orange Money',
  CASH_ON_DELIVERY: '💵 Livraison',
  PAYPAL: '💳 PayPal',
}

export default async function OrdersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // Récupérer TOUTES les commandes du client (pas juste isPaid)
  const orders = await prisma.order.findMany({
    where: { clerkUserId: userId },
    include: {
      orderItems: {
        include: { product: { include: { images: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Mes Commandes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Suivez l&apos;avancement de vos commandes en temps réel
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/30 rounded-3xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Aucune commande</h2>
            <p className="mt-2 text-muted-foreground text-sm">Vous n&apos;avez pas encore passé de commande.</p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 bg-foreground text-background font-bold uppercase tracking-widest px-6 py-3 rounded-xl text-sm hover:bg-foreground/90 transition-all"
            >
              Découvrir la collection
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = STATUS_MAP[order.status] ?? STATUS_MAP.PENDING
              const StatusIcon = statusInfo.icon
              const total = order.orderItems.reduce(
                (acc, item) => acc + Number(item.product.price) * item.quantity, 0
              )
              const paymentLabel = PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod

              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden">

                  {/* En-tête */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-secondary/40 border-b border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Commande</p>
                        <p className="font-black text-foreground text-sm tracking-widest">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-border" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Date</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-border" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total</p>
                        <p className="text-sm font-black text-foreground">{formatPrice(total)}</p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-border" />
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Paiement</p>
                        <p className="text-sm font-medium text-foreground">{paymentLabel}</p>
                      </div>
                    </div>

                    {/* Badge de statut */}
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Barre de progression visuelle */}
                  <div className="px-6 py-3 border-b border-border bg-secondary/10">
                    <div className="flex items-center gap-1">
                      {(['PENDING', 'PAYMENT_RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map((step, i) => {
                        const steps = ['PENDING', 'PAYMENT_RECEIVED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                        const currentIdx = steps.indexOf(order.status)
                        const isActive = i <= currentIdx && order.status !== 'CANCELLED'
                        return (
                          <div key={step} className="flex-1 flex items-center gap-1">
                            <div className={`h-1.5 rounded-full flex-1 transition-colors ${isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] text-muted-foreground uppercase tracking-widest">
                      <span>Commande</span>
                      <span>Paiement</span>
                      <span>Préparation</span>
                      <span>Expédition</span>
                      <span>Livraison</span>
                    </div>
                  </div>

                  {/* Articles */}
                  <div className="divide-y divide-border">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                          {item.product.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-foreground text-sm truncate">{item.product.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            {item.size && <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">Taille: {item.size}</span>}
                            {item.color && <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full capitalize">{item.color}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-foreground">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer avec adresse + lien suivi */}
                  <div className="flex items-center justify-between px-6 py-3 bg-secondary/20 border-t border-border">
                    {order.address ? (
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Truck className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-foreground">Livraison :</strong> {order.address}</span>
                      </div>
                    ) : <div />}
                    <Link
                      href={`/success/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-foreground hover:underline"
                    >
                      Détails <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
