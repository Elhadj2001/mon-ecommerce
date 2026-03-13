'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { formatPrice } from '@/lib/currency'

interface PromoData {
  code: string;
  discountPercent?: number | null;
  discountAmount?: number | null;
}

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [promo, setPromo] = useState<PromoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hidden = sessionStorage.getItem('announcement_closed')
    
    // Si l'utilisateur a fermé la barre, on arrête là
    if (hidden === 'true') {
      setLoading(false)
      return
    }

    // Sinon, on cherche s'il y a un code promo actif
    const fetchPromo = async () => {
      try {
        const res = await fetch('/api/promo/active')
        if (!res.ok) throw new Error()
        const data = await res.json()
        
        if (data && data.code) {
          setPromo(data)
          setIsVisible(true)
        }
      } catch (error) {
        console.error("Erreur chargement code promo")
      } finally {
        setLoading(false)
      }
    }

    fetchPromo()
  }, [])

  if (loading) {
    return (
      <div className="bg-[#09090b] text-white flex justify-center py-2 md:py-2.5 min-h-[40px]">
        <Loader2 className="w-4 h-4 animate-spin text-white/50" />
      </div>
    )
  }

  if (!isVisible || !promo) return null

  const handleClose = () => {
    setIsVisible(false)
    sessionStorage.setItem('announcement_closed', 'true')
  }

  const promoLabel = promo.discountPercent 
    ? `-${promo.discountPercent}% sur toute la boutique !`
    : promo.discountAmount 
    ? `-${formatPrice(promo.discountAmount)} sur votre commande !`
    : `sur vos achats !`

  return (
    <div className="bg-[#09090b] text-white relative z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-2.5">
        <div className="flex items-center justify-center gap-x-4 pr-6 text-center text-[10px] md:text-xs">
          <p className="font-bold tracking-[0.1em] md:tracking-[0.2em] uppercase">
            <span className="text-[#c9a84c] mr-2">OFFRE EXCLUSIVE :</span> 
            Utilisez le code <span className="bg-white/20 px-1.5 py-0.5 rounded mx-1 text-white font-black tracking-widest text-[11px] md:text-sm">{promo.code}</span> pour {promoLabel}
          </p>
        </div>
        <button
          onClick={handleClose}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  )
}
