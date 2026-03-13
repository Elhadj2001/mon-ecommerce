import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/currency'
import Link from 'next/link'
import { Tag, Plus, AlertTriangle, CheckCircle } from 'lucide-react'
import PromoDeleteButton from '@/components/admin/PromoDeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">Codes Promo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{promos.length} code(s) créé(s)</p>
        </div>
        <Link
          href="/admin/promos/new"
          className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#09090b] px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-[#f0d080] transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau Code
        </Link>
      </div>

      {promos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Aucun code promo. Créez-en un pour fidéliser vos clients !</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {promos.map((promo) => {
            const isExpired = promo.expiresAt && new Date() > promo.expiresAt
            const isMaxed = promo.usedCount >= promo.maxUses
            const isDisabled = !promo.isActive || isExpired || isMaxed

            return (
              <div
                key={promo.id}
                className={`bg-card border rounded-2xl overflow-hidden transition-all ${
                  isDisabled
                    ? 'border-border opacity-60'
                    : 'border-[#c9a84c]/30 shadow-sm hover:shadow-md'
                }`}
              >
                <div className={`px-5 py-4 border-b border-border flex items-center justify-between ${
                  isDisabled ? 'bg-secondary/20' : 'bg-secondary/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isDisabled ? 'bg-gray-100 dark:bg-gray-800' : 'bg-[#c9a84c]/10'
                    }`}>
                      <Tag className={`w-5 h-5 ${isDisabled ? 'text-muted-foreground' : 'text-[#c9a84c]'}`} />
                    </div>
                    <div>
                      <p className="font-black text-foreground text-lg tracking-widest">{promo.code}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                        {promo.discountPercent ? `-${promo.discountPercent}%` : ``}
                        {promo.discountAmount ? `-${formatPrice(promo.discountAmount)}` : ''}
                      </p>
                    </div>
                  </div>
                  {isDisabled ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full border border-red-200 dark:border-red-800 font-bold">
                      <AlertTriangle className="w-3 h-3" /> Inactif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full border border-green-200 dark:border-green-800 font-bold">
                      <CheckCircle className="w-3 h-3" /> Actif
                    </span>
                  )}
                </div>

                <div className="px-5 py-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Utilisations</span>
                    <span className="font-bold text-foreground">{promo.usedCount} / {promo.maxUses}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${isMaxed ? 'bg-red-500' : 'bg-[#c9a84c]'}`}
                      style={{ width: `${Math.min(100, (promo.usedCount / promo.maxUses) * 100)}%` }}
                    />
                  </div>
                  {promo.minOrderAmount && (
                    <div className="flex justify-between">
                      <span>Commande min.</span>
                      <span className="font-bold text-foreground">{formatPrice(promo.minOrderAmount)}</span>
                    </div>
                  )}
                  {promo.expiresAt && (
                    <div className="flex justify-between">
                      <span>Expire le</span>
                      <span className={`font-bold ${isExpired ? 'text-red-600' : 'text-foreground'}`}>
                        {new Date(promo.expiresAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-border bg-secondary/10 flex justify-end">
                  <PromoDeleteButton promoId={promo.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
