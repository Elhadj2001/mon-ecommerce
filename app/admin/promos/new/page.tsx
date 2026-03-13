'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ChevronLeft, Save, Loader2, Tag, Percent, Hash, Calendar, ShoppingBag } from 'lucide-react'

export default function NewPromoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    discountPercent: '',
    discountAmount: '',
    minOrderAmount: '',
    maxUses: '100',
    expiresAt: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.code.trim()) {
      toast.error('Le code promo est requis')
      return
    }

    if (form.discountType === 'percent' && (!form.discountPercent || Number(form.discountPercent) <= 0)) {
      toast.error('Le pourcentage de réduction est requis')
      return
    }

    if (form.discountType === 'amount' && (!form.discountAmount || Number(form.discountAmount) <= 0)) {
      toast.error('Le montant de réduction est requis')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          discountPercent: form.discountType === 'percent' ? Number(form.discountPercent) : null,
          discountAmount: form.discountType === 'amount' ? Number(form.discountAmount) / 655.957 : null, // Conversion FCFA → EUR
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) / 655.957 : null,
          maxUses: Number(form.maxUses) || 100,
          expiresAt: form.expiresAt || null,
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }

      toast.success('Code promo créé !')
      router.push('/admin/promos')
      router.refresh()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erreur interne'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft size={14} /> Retour
        </button>
        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Nouveau Code Promo</h1>
        <p className="text-sm text-muted-foreground mt-1">Créez un code de réduction pour vos clients</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">

        {/* Code */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#c9a84c]" /> Code
          </h3>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Code promo (ex: NIANG10, BIENVENUE)
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="NIANG10"
              className="w-full border border-border bg-secondary/30 p-3 rounded-xl text-foreground font-mono text-lg tracking-widest uppercase placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none transition-all"
              disabled={loading}
            />
          </div>
        </div>

        {/* Réduction */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <Percent className="w-4 h-4 text-[#c9a84c]" /> Réduction
          </h3>

          {/* Type de réduction */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, discountType: 'percent' })}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                form.discountType === 'percent'
                  ? 'border-[#c9a84c] bg-[#c9a84c]/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Percent className={`w-5 h-5 mx-auto mb-1 ${form.discountType === 'percent' ? 'text-[#c9a84c]' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-bold ${form.discountType === 'percent' ? 'text-foreground' : 'text-muted-foreground'}`}>Pourcentage</p>
              <p className="text-[10px] text-muted-foreground">Ex: -10%</p>
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, discountType: 'amount' })}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                form.discountType === 'amount'
                  ? 'border-[#c9a84c] bg-[#c9a84c]/5'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Hash className={`w-5 h-5 mx-auto mb-1 ${form.discountType === 'amount' ? 'text-[#c9a84c]' : 'text-muted-foreground'}`} />
              <p className={`text-sm font-bold ${form.discountType === 'amount' ? 'text-foreground' : 'text-muted-foreground'}`}>Montant fixe</p>
              <p className="text-[10px] text-muted-foreground">Ex: -5 000 FCFA</p>
            </button>
          </div>

          {/* Valeur */}
          {form.discountType === 'percent' ? (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Pourcentage de réduction
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountPercent"
                  value={form.discountPercent}
                  onChange={handleChange}
                  placeholder="10"
                  min="1"
                  max="100"
                  className="w-full border border-border bg-secondary/30 p-3 pr-10 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                  disabled={loading}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Montant de réduction (FCFA)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="discountAmount"
                  value={form.discountAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  min="1"
                  className="w-full border border-border bg-secondary/30 p-3 pl-14 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                  disabled={loading}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">FCFA</span>
              </div>
            </div>
          )}
        </div>

        {/* Conditions */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#c9a84c]" /> Conditions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Commande minimum (FCFA)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={form.minOrderAmount}
                onChange={handleChange}
                placeholder="Optionnel"
                className="w-full border border-border bg-secondary/30 p-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                Utilisations max
              </label>
              <input
                type="number"
                name="maxUses"
                value={form.maxUses}
                onChange={handleChange}
                placeholder="100"
                min="1"
                className="w-full border border-border bg-secondary/30 p-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Date d&apos;expiration
            </label>
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="w-full border border-border bg-secondary/30 p-3 rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-[#c9a84c]/30 focus:border-[#c9a84c] outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#c9a84c] text-[#09090b] py-4 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#f0d080] transition-colors disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours...</>
          ) : (
            <><Save className="w-4 h-4" /> Créer le Code Promo</>
          )}
        </button>

      </form>
    </div>
  )
}
