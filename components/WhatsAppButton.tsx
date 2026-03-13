'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\s/g, '') || '221781737959'
  const message = encodeURIComponent("Bonjour Maison Niang ! J'ai une question sur vos articles.")
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`

  useEffect(() => {
    // Afficher le bouton après un délai pour ne pas gêner le chargement initial
    const timer = setTimeout(() => setIsVisible(true), 3000)
    // Afficher le tooltip automatiquement après 5s
    const tooltipTimer = setTimeout(() => setShowTooltip(true), 6000)
    // Masquer le tooltip après 12s
    const hideTooltip = setTimeout(() => setShowTooltip(false), 15000)

    return () => {
      clearTimeout(timer)
      clearTimeout(tooltipTimer)
      clearTimeout(hideTooltip)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 pr-8 max-w-[240px] border border-gray-100 dark:border-gray-700 animate-in slide-in-from-right-2 relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
          <p className="text-sm font-bold text-gray-900 dark:text-white">Besoin d&apos;aide ?</p>
          <p className="text-xs text-gray-500 mt-1">
            Écrivez-nous sur WhatsApp, nous répondons en quelques minutes !
          </p>
        </div>
      )}

      {/* Bouton WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
        aria-label="Nous contacter sur WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" fill="white" />
        {/* Indicateur de disponibilité */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
      </a>
    </div>
  )
}
