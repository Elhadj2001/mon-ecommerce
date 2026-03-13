'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { value: 'PENDING', label: '⏳ En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'PAYMENT_RECEIVED', label: '💰 Paiement reçu', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'PROCESSING', label: '📦 En préparation', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'SHIPPED', label: '🚚 Expédiée', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'DELIVERED', label: '✅ Livrée', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'CANCELLED', label: '❌ Annulée', color: 'bg-red-100 text-red-800 border-red-200' },
]

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      setStatus(newStatus)
      toast.success(`Statut mis à jour → ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const currentOption = STATUS_OPTIONS.find(s => s.value === status)

  return (
    <div className="relative">
      <select
        value={status}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`appearance-none text-xs font-bold px-3 py-1.5 pr-7 rounded-full border cursor-pointer transition-all disabled:opacity-50 ${currentOption?.color || 'bg-gray-100 text-gray-800 border-gray-200'}`}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
