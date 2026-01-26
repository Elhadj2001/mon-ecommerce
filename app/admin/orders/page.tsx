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
      
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Articles</th>
              <th className="px-6 py-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="text-sm">
                <td className="px-6 py-4 font-mono text-gray-500 uppercase">{order.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  {order.isPaid ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">Payé</span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">En attente</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {order.orderItems.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                </td>
                <td className="px-6 py-4 text-right font-bold">
                  {Number(order.orderItems.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0)).toFixed(2)} €
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}