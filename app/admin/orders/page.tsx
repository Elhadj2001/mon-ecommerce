import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/currency'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orderItems: {
        include: { product: true }
      }
    }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Commandes</h1>
        <p className="text-sm text-muted-foreground mt-1">{orders.length} commande(s) au total</p>
      </div>
      
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-secondary border-b border-border text-xs uppercase tracking-widest font-bold text-muted-foreground">
            <tr>
              <th className="px-6 py-4">Ref.</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 w-[35%]">Articles</th>
              <th className="px-6 py-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const total = order.orderItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)
              return (
                <tr key={order.id} className="text-sm hover:bg-secondary/40 transition-colors">
                  
                  <td className="px-6 py-4 font-black text-foreground uppercase tracking-widest font-mono text-xs">
                    #{order.id.slice(0, 8)}
                  </td>

                  <td className="px-6 py-4">
                    {order.isPaid ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                        Payé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
                        En attente
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground text-xs">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-start gap-2">
                          <span className="font-bold text-foreground whitespace-nowrap">{item.quantity} ×</span>
                          <div>
                            <span className="font-medium text-foreground">{item.product.name}</span>
                            <div className="flex flex-wrap gap-1.5 mt-0.5">
                              {item.size && (
                                <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                                  T: <span className="font-bold text-foreground">{item.size}</span>
                                </span>
                              )}
                              {item.color && (
                                <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                                  {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-black text-foreground">
                    {formatPrice(total)}
                  </td>
                </tr>
              )
            })}
            
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                  Aucune commande pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}