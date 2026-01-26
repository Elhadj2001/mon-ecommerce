import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  // On récupère toutes les commandes PAYÉES
  const orders = await prisma.order.findMany({
    where: { isPaid: true },
    include: { orderItems: { include: { product: true } } }
  })

  // On crée l'en-tête du CSV
  let csv = 'Commande ID,Date,Email,Total,Produits\n'

  // On remplit les lignes
  orders.forEach(order => {
    // Calcul du total
    const total = order.orderItems.reduce((acc, item) => {
        return acc + (Number(item.product.price) * item.quantity)
    }, 0)

    // Liste des produits en texte
    const productNames = order.orderItems.map(i => `${i.quantity}x ${i.product.name}`).join(' | ')

    // On ajoute la ligne (en protégeant les virgules)
    // Note: Pour l'email, on prend celui du Stripe (ou une valeur fictive si non stocké, ici on assume que tu vas le stocker ou qu'on prend l'info phone/address)
    // Pour cet exemple simple, on exporte l'adresse et le téléphone qui sont dans ta DB
    csv += `${order.id},${order.createdAt.toISOString()},${order.phone},${total.toFixed(2)},"${productNames}"\n`
  })

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="orders.csv"',
    },
  })
}