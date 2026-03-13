'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function PromoDeleteButton({ promoId }: { promoId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Supprimer ce code promo ?')) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/promos/${promoId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur')
      toast.success('Code promo supprimé')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-red-600 transition-colors uppercase tracking-wider disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
      Supprimer
    </button>
  )
}
