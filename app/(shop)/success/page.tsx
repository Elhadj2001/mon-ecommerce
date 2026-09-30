'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/hooks/use-cart'
import Link from 'next/link'
import { CheckCircle, Package, Truck, Home, ShoppingBag, ArrowRight, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  { icon: CheckCircle, label: 'Commande confirmée', description: 'Paiement validé' },
  { icon: Package, label: 'En préparation', description: 'Sous 24h' },
  { icon: Truck, label: 'En livraison', description: 'Délai : 3-5 jours' },
  { icon: Home, label: 'Livré', description: 'À votre domicile' },
]

export default function SuccessPage() {
  const cart = useCart()
  const [orderId] = useState(() => `CMD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`)

  useEffect(() => {
    cart.clearCart()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full mx-auto text-center">

        {/* Icône animée de succès */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-8 mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-500" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Titre & Sous-titre */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase">
            Merci pour votre commande !
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Votre paiement a été confirmé. Vous allez recevoir un email de récapitulatif dans quelques instants.
          </p>
        </motion.div>

        {/* Badge numéro de commande */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 inline-flex items-center gap-3 bg-secondary border border-border rounded-2xl px-6 py-4"
        >
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Référence de commande</p>
            <p className="text-lg font-black text-foreground tracking-widest">{orderId}</p>
          </div>
        </motion.div>

        {/* Étapes de livraison */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-secondary/50 border border-border rounded-3xl p-6 md:p-8"
        >
          <h2 className="text-sm uppercase tracking-widest font-black text-muted-foreground mb-8">
            Suivi de votre commande
          </h2>
          
          <div className="relative flex justify-between items-start">
            {/* Ligne de progression */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-border mx-[calc(100%/8)]" />
            <motion.div 
              className="absolute top-6 left-0 h-0.5 bg-emerald-500 mx-[calc(100%/8)]"
              initial={{ width: '0%' }}
              animate={{ width: '0%' }}
              style={{ right: 'calc(100% - 100%/8)' }}
            />
            
            {steps.map((step, index) => (
              <div key={step.label} className="flex flex-col items-center gap-3 flex-1 z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, type: 'spring' }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    index === 0 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-background border-border text-muted-foreground'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </motion.div>
                <div className="text-center hidden sm:block">
                  <p className={`text-xs font-bold uppercase tracking-wide ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground text-background font-black uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-foreground/90 transition-all text-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Continuer mes achats
          </Link>
          <Link
            href="/account/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-border text-foreground font-bold uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-secondary transition-all text-sm"
          >
            Voir mes commandes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}