'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Package, RefreshCw } from 'lucide-react'

interface StockFormProps {
  productId: string
  initialStock: number
}

export default function StockForm({ productId, initialStock }: StockFormProps) {
  const [stock, setStock] = useState(initialStock)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onUpdateStock = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stock: stock // On envoie la nouvelle valeur
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour")
      }

      toast.success("Stock mis à jour avec succès !")
      router.refresh() // Rafraîchit la page pour voir les changements
    } catch (error) {
      toast.error("Impossible de mettre à jour le stock.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-white shadow-sm max-w-sm">
      <div className="p-2 bg-blue-50 rounded-full">
        <Package className="w-5 h-5 text-blue-600" />
      </div>
      
      <div className="flex-1">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Stock actuel
        </label>
        <input 
          type="number" 
          min="0"
          disabled={loading}
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          className="w-full mt-1 border-gray-300 rounded-md focus:ring-black focus:border-black font-bold text-lg"
        />
      </div>

      <button
        onClick={onUpdateStock}
        disabled={loading || stock === initialStock}
        className="flex items-center justify-center h-10 w-10 rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-50 transition"
        title="Sauvegarder le stock"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
      </button>
    </div>
  )
}