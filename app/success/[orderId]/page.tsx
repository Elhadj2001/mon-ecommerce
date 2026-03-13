import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/currency"
import { CheckCircle2, Wallet, CreditCard, Truck, Home } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getOrder(orderId: string) {
  try {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    })
  } catch (error) {
    console.error("[SUCCESS_PAGE_GET_ORDER]", error)
    return null
  }
}

const STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  PENDING:          { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-800", description: "Votre commande est enregistrée. En attente de confirmation de paiement." },
  PAYMENT_RECEIVED: { label: "Paiement reçu",          color: "bg-blue-100 text-blue-800",   description: "Paiement confirmé, votre commande est en cours de préparation." },
  PROCESSING:       { label: "En préparation",          color: "bg-indigo-100 text-indigo-800", description: "Votre commande est en cours de traitement par notre équipe." },
  SHIPPED:          { label: "Expédiée",                color: "bg-purple-100 text-purple-800", description: "Votre commande est en route !" },
  DELIVERED:        { label: "Livrée",                   color: "bg-green-100 text-green-800", description: "Votre commande a bien été livrée. Merci pour votre confiance !" },
  CANCELLED:        { label: "Annulée",                 color: "bg-red-100 text-red-800",     description: "Cette commande a été annulée. Contactez-nous pour plus d'informations." },
}

const PAYMENT_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+221 78 173 79 59"

export default async function SuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const order = await getOrder(orderId)

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-5xl">😕</div>
        <h1 className="text-2xl font-bold text-gray-900">Commande introuvable</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Vérifiez l&apos;URL ou contactez-nous si vous pensez que c&apos;est une erreur.
        </p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 bg-black text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
          <Home size={16} /> Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const total = order.orderItems.reduce((acc, item) => acc + Number(item.product.price) * item.quantity, 0)
  const firstName = order.name ? order.name.split(' ')[0] : "Client"
  const statusInfo = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* EN-TÊTE */}
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-5">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-2">
            Commande enregistrée !
          </h1>
          <p className="text-gray-500">
            Merci <strong>{firstName}</strong> !
            Référence :{" "}
            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm font-bold">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
          </p>
        </div>

        {/* SUIVI DE COMMANDE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Statut de votre commande</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color}`}>
            <span className="w-2 h-2 rounded-full bg-current opacity-70 animate-pulse" />
            {statusInfo.label}
          </div>
          <p className="text-gray-500 text-sm mt-3">{statusInfo.description}</p>
          <p className="text-xs text-gray-400 mt-2">
            Vous pouvez suivre votre commande en revenant sur cette page.
            {order.phone && (
              <> Notre équipe vous contactera au <strong>{order.phone}</strong>.</>
            )}
          </p>
        </div>

        {/* INSTRUCTIONS DE PAIEMENT */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest mb-6 border-b pb-4 flex items-center gap-2">
            <Wallet size={20} className="text-black" />
            Instructions de paiement
          </h2>

          {/* WAVE */}
          {order.paymentMethod === 'WAVE' && (
            <div className="border border-blue-100 bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
                🌊 Paiement Wave
              </h3>
              <p className="text-blue-800/80 text-sm mb-4">
                Envoyez <strong>{formatPrice(total)}</strong> sur Wave au numéro ci-dessous en indiquant votre référence de commande.
              </p>
              <div className="bg-white border-2 border-blue-200 text-blue-900 font-black text-2xl tracking-widest py-3 px-6 rounded-xl inline-block shadow-sm">
                {PAYMENT_NUMBER}
              </div>
              <p className="text-xs text-blue-700/70 mt-3">
                ✅ Mentionnez la référence <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> dans votre transfer.
              </p>
            </div>
          )}

          {/* ORANGE MONEY */}
          {order.paymentMethod === 'ORANGE_MONEY' && (
            <div className="border border-orange-100 bg-orange-50 rounded-xl p-6">
              <h3 className="font-bold text-orange-900 text-lg mb-2 flex items-center gap-2">
                🟠 Paiement Orange Money
              </h3>
              <p className="text-orange-800/80 text-sm mb-4">
                Envoyez <strong>{formatPrice(total)}</strong> via Orange Money au numéro ci-dessous.
              </p>
              <div className="bg-white border-2 border-orange-200 text-orange-900 font-black text-2xl tracking-widest py-3 px-6 rounded-xl inline-block shadow-sm">
                {PAYMENT_NUMBER}
              </div>
              <p className="text-xs text-orange-700/70 mt-3">
                ✅ Précisez la référence <strong>#{order.id.slice(0, 8).toUpperCase()}</strong> lors de l&apos;envoi.
              </p>
            </div>
          )}

          {/* PAYPAL */}
          {order.paymentMethod === 'PAYPAL' && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                <CreditCard size={18} />
                Paiement PayPal / Carte bancaire
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Cliquez sur le bouton ci-dessous pour régler <strong>{formatPrice(total)}</strong> via PayPal. Indiquez votre référence dans la note.
              </p>
              <a
                href="https://paypal.me/maisonniang"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#003087] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#002060] transition-colors"
              >
                Payer {formatPrice(total)} via PayPal.me
              </a>
              <p className="text-xs text-gray-400 mt-3">
                📌 Référence : <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
              </p>
            </div>
          )}

          {/* PAIEMENT À LA LIVRAISON */}
          {order.paymentMethod === 'CASH_ON_DELIVERY' && (
            <div className="border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-2 flex items-center gap-2">
                <Truck size={18} />
                Paiement à la livraison
              </h3>
              <p className="text-gray-500 text-sm">
                Parfait ! Vous réglez <strong>{formatPrice(total)}</strong> en espèces lors de la réception de votre colis.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Notre équipe vous contactera au <strong>{order.phone}</strong> via WhatsApp pour confirmer la livraison et l&apos;heure de passage.
              </p>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-700 font-medium">
                  ⚠️ Le paiement à la livraison est disponible uniquement à Dakar et dans certaines zones. Notre équipe vous confirmera votre éligibilité.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RÉCAPITULATIF */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-5">Résumé des articles</h2>
          <ul className="divide-y divide-gray-100">
            {order.orderItems.map((item) => (
              <li key={item.id} className="py-4 flex justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-gray-900 text-sm">{item.product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qté : {item.quantity}
                    {item.size && ` • Taille: ${item.size}`}
                    {item.color && ` • ${item.color}`}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-sm whitespace-nowrap">
                  {formatPrice(Number(item.product.price) * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
            <span className="font-bold text-gray-900">Total</span>
            <span className="font-black text-black text-2xl">{formatPrice(total)}</span>
          </div>
        </div>

        {/* RETOUR */}
        <div className="text-center pb-8">
          <Link href="/" className="text-sm text-gray-400 underline hover:text-gray-700 transition-colors">
            Continuer mes achats
          </Link>
        </div>

      </div>
    </div>
  )
}
