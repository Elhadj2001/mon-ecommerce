'use client'

import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { formatPrice, convertToXof } from "@/lib/currency"
import { CustomImage } from "@/components/ui/CustomImage"
import { ShieldCheck, Truck, ArrowRight, Loader2, Smartphone, Wallet, CheckCircle2, Tag, X } from "lucide-react"
import toast from "react-hot-toast"

type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'CASH_ON_DELIVERY' | 'PAYPAL'

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string; icon: string; recommended?: boolean }[] = [
  {
    value: 'WAVE',
    label: 'Wave',
    description: 'Paiement instantané via Wave. Rapide et sécurisé.',
    icon: '🌊',
    recommended: true,
  },
  {
    value: 'ORANGE_MONEY',
    label: 'Orange Money',
    description: 'Paiement via Orange Money. Disponible partout au Sénégal.',
    icon: '🟠',
  },
  {
    value: 'PAYPAL',
    label: 'PayPal / Carte bancaire',
    description: 'Pour les paiements internationaux ou par carte.',
    icon: '💳',
  },
  {
    value: 'CASH_ON_DELIVERY',
    label: 'Paiement à la livraison',
    description: 'Réservé à Dakar. Réglez en espèces à la réception. Notre équipe vous contactera.',
    icon: '💵',
  },
]

export default function CheckoutPage() {
  const cart = useCart()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('WAVE')

  // Code promo
  const [promoInput, setPromoInput] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountEur: number; message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: ""
  })

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  if (cart.items.length === 0) {
    router.push("/cart")
    return null
  }

  const subtotalEur = cart.items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity
  }, 0)

  // Frais de livraison automatiques selon la ville
  const city = formData.city.toLowerCase().trim()
  let shippingEur = 0
  let shippingLabel = 'Sélectionnez une ville'
  if (city) {
    if (city === 'dakar' || city.includes('dakar')) {
      shippingEur = 0
      shippingLabel = 'Gratuite (Dakar)'
    } else if (['thiès', 'thies', 'saint-louis', 'saint louis', 'kaolack', 'ziguinchor', 'mbour', 'touba', 'rufisque', 'diourbel', 'tambacounda', 'louga', 'matam', 'fatick', 'kolda', 'kédougou', 'kedougou', 'sédhiou', 'sedhiou', 'kaffrine'].some(v => city.includes(v))) {
      shippingEur = 4.57 // ~3000 FCFA
      shippingLabel = `${convertToXof(4.57).toLocaleString('fr-FR')} FCFA (Sénégal)`
    } else {
      shippingEur = 22.87 // ~15000 FCFA
      shippingLabel = `${convertToXof(22.87).toLocaleString('fr-FR')} FCFA (International)`
    }
  }

  const discountEur = appliedPromo?.discountEur || 0
  const grandTotalEur = Math.max(0, subtotalEur + shippingEur - discountEur)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Validation du code promo
  const validatePromo = async () => {
    if (!promoInput.trim()) return
    setPromoLoading(true)
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput, subtotal: subtotalEur })
      })
      const data = await res.json()
      if (data.valid) {
        setAppliedPromo({ code: data.code, discountEur: data.discountEur, message: data.message })
        toast.success(data.message)
      } else {
        toast.error(data.error || 'Code invalide')
      }
    } catch {
      toast.error('Erreur de validation')
    } finally {
      setPromoLoading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/checkout/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            id: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor
          })),
          customer: formData,
          paymentMethod: selectedPayment,
          promoCode: appliedPromo?.code || null,
          discount: discountEur,
          shippingCost: shippingEur
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      const data = await response.json()

      cart.clearCart()

      toast.success("Commande enregistrée !")
      router.push(`/success/${data.orderId}`)

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue."
      console.error("[CHECKOUT_ERROR]", error)
      toast.error(message)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-black">Finaliser la Commande</h1>
          <p className="mt-2 text-gray-500">Remplissez vos informations et choisissez votre moyen de paiement.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-16">

          {/* COLONNE GAUCHE : FORMULAIRE */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={onSubmit} className="space-y-8">

              {/* SECTION 1 : ADRESSE */}
              <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <Truck className="text-black" size={20} />
                  Adresse de livraison
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom &amp; Prénom complet *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ex: Aissatou Ndiaye"
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-3 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone (WhatsApp) *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+221 77 123 45 67"
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-3 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Adresse E-mail (Optionnel)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Pour le reçu"
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-3 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Adresse complète *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Quartier, Rue, Numéro..."
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-3 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ville / Région *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Ex: Dakar, Sénégal"
                      className="w-full border border-gray-300 rounded-lg shadow-sm focus:border-black focus:ring-1 focus:ring-black outline-none px-4 py-3 transition"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2 : CHOIX DU MOYEN DE PAIEMENT */}
              <div className="bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <Wallet className="text-black" size={20} />
                  Moyen de paiement
                </h2>

                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPayment(option.value)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedPayment === option.value
                          ? 'border-black bg-white shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-400'
                      }`}
                    >
                      {/* Indicateur de sélection */}
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selectedPayment === option.value ? 'border-black bg-black' : 'border-gray-300'
                      }`}>
                        {selectedPayment === option.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      <span className="text-2xl flex-shrink-0">{option.icon}</span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">{option.label}</span>
                          {option.recommended && (
                            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Recommandé</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BADGE SÉCURITÉ */}
              <div className="bg-gray-50 flex items-start gap-4 p-4 rounded-xl border border-gray-100">
                <ShieldCheck className="text-green-600 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Commande sécurisée</h3>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    Vos informations sont utilisées uniquement pour la livraison. Les instructions de paiement vous seront communiquées à l&apos;étape suivante.
                  </p>
                </div>
              </div>

              {/* BOUTON SOUMETTRE */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-black text-white py-4 px-8 rounded-xl font-bold text-lg uppercase tracking-wide hover:bg-gray-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    Confirmer la commande
                  </>
                )}
              </button>

            </form>
          </div>

          {/* COLONNE DROITE : RÉSUMÉ */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white dark:bg-card border border-gray-100 dark:border-border shadow-xl rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-foreground mb-6 uppercase tracking-wide">
                Récapitulatif ({cart.items.length} article{cart.items.length > 1 ? 's' : ''})
              </h2>

              <ul className="divide-y divide-gray-100 dark:divide-border mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <li key={item.cartId} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 bg-gray-50 dark:bg-secondary rounded-lg overflow-hidden border border-gray-100 dark:border-border flex-shrink-0">
                        <CustomImage
                          src={item.images?.[0] || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qté: {item.quantity}
                          {item.selectedSize && ` • ${item.selectedSize}`}
                          {item.selectedColor && ` • ${item.selectedColor}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-foreground whitespace-nowrap">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Code promo */}
              <div className="mb-4 pb-4 border-b border-gray-100 dark:border-border">
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700 dark:text-green-400">{appliedPromo.code}</span>
                      <span className="text-xs text-green-600 dark:text-green-400">{appliedPromo.message}</span>
                    </div>
                    <button onClick={() => setAppliedPromo(null)} className="text-green-600 hover:text-green-800">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      placeholder="Code promo"
                      className="w-full sm:flex-1 text-sm border border-gray-200 dark:border-border bg-gray-50 dark:bg-secondary rounded-lg px-4 py-3 sm:py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-black/20"
                    />
                    <button
                      type="button"
                      onClick={validatePromo}
                      disabled={promoLoading || !promoInput.trim()}
                      className="w-full sm:w-auto shrink-0 px-4 py-3 sm:py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-wide rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Appliquer'}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-semibold text-foreground">{formatPrice(subtotalEur)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className={`font-semibold ${shippingEur === 0 ? 'text-green-600' : 'text-foreground'}`}>
                    {shippingEur === 0 && city ? '🎉 Gratuite' : shippingLabel}
                  </span>
                </div>
                {discountEur > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 flex items-center gap-1"><Tag size={14} /> Réduction</span>
                    <span className="font-semibold text-green-600">-{formatPrice(discountEur)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Paiement</span>
                  <span className="font-semibold text-foreground">
                    {PAYMENT_OPTIONS.find(p => p.value === selectedPayment)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 dark:border-border pt-4 mt-2">
                  <span className="text-base font-bold text-foreground uppercase">Total</span>
                  <span className="text-2xl font-black text-foreground">{formatPrice(grandTotalEur)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
