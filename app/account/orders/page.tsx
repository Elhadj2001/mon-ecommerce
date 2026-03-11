import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/currency"
import { Package, CheckCircle, Clock, Truck } from "lucide-react"
import Link from "next/link"

function getStatusDetails(isPaid: boolean) {
  if (isPaid) return { label: "Payée", icon: CheckCircle, className: "text-emerald-600 bg-emerald-50 border-emerald-200" }
  return { label: "En attente", icon: Clock, className: "text-amber-600 bg-amber-50 border-amber-200" }
}

export default async function OrdersPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  // Récupération des commandes de l'utilisateur connecté
  // Note : Pour lier les commandes à un user Clerk, il faudrait stocker le clerkUserId
  // dans la table Order. Pour l'instant, on affiche les dernières commandes payées.
  const orders = await prisma.order.findMany({
    where: { isPaid: true },
    include: {
      orderItems: {
        include: { product: { include: { images: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  })

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">
            Mes Commandes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Retrouvez l'historique de toutes vos commandes
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-secondary/30 rounded-3xl border border-border">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Aucune commande</h2>
            <p className="mt-2 text-muted-foreground text-sm">Vous n'avez pas encore passé de commande.</p>
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
              const status = getStatusDetails(order.isPaid)
              const StatusIcon = status.icon
              const total = order.orderItems.reduce(
                (acc, item) => acc + Number(item.product.price) * item.quantity, 0
              )

              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  
                  {/* En-tête commande */}
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
                    </div>

                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${status.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.label}
                    </span>
                  </div>

                  {/* Produits */}
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
                            {item.color && <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">Couleur: {item.color}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-foreground">{formatPrice(Number(item.product.price))}</p>
                          <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adresse de livraison si disponible */}
                  {order.address && (
                    <div className="flex items-start gap-3 px-6 py-4 border-t border-border bg-secondary/20">
                      <Truck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-foreground">Livraison : </span>
                        {order.address}
                      </p>
                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
