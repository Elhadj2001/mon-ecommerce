import { prisma } from '@/lib/prisma'

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
      <h1 className="text-3xl font-bold tracking-tighter">COMMANDES</h1>
      
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase tracking-widest font-bold text-gray-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 w-[40%]">Articles & Détails</th>
              <th className="px-6 py-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors">
                
                {/* ID de la commande */}
                <td className="px-6 py-4 font-mono text-gray-500 uppercase">
                  #{order.id.slice(0, 8)}
                </td>

                {/* Statut de paiement */}
                <td className="px-6 py-4">
                  {order.isPaid ? (
                    <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      Payé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                      En attente
                    </span>
                  )}
                </td>

                {/* --- C'EST ICI QUE TOUT CHANGE POUR L'AFFICHAGE --- */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-3">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-2">
                        {/* Quantité */}
                        <span className="font-bold whitespace-nowrap text-gray-900">
                          {item.quantity} x
                        </span>
                        
                        <div>
                          {/* Nom du produit */}
                          <span className="font-medium text-gray-800">
                            {item.product.name}
                          </span>
                          
                          {/* Détails (Taille / Couleur) */}
                          <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-gray-500">
                            
                            {/* Affichage de la Taille */}
                            {item.size && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                Taille: <span className="font-semibold text-gray-700">{item.size}</span>
                              </span>
                            )}

                            {/* Affichage de la Couleur */}
                            {item.color && (
                              <span className="flex items-center gap-1.5 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                <span 
                                  className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                                  style={{ backgroundColor: item.color.toLowerCase() }}
                                />
                                <span className="font-semibold text-gray-700 capitalize">
                                  {item.color}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </td>

                {/* Montant Total */}
                <td className="px-6 py-4 text-right font-black text-gray-900">
                  {Number(order.orderItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)).toFixed(2)} €
                </td>

              </tr>
            ))}
            
            {/* Si aucune commande */}
            {orders.length === 0 && (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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