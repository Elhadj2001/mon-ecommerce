'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import Link from 'next/link'

const LINKS = {
  shop: [
    { label: 'Nouveautés', href: '/products?sort=new' },
    { label: 'Promotions', href: '/products?isPromo=true' },
    { label: 'Tous les produits', href: '/products' },
    { label: 'Ma wishlist', href: '/wishlist' },
  ],
  info: [
    { label: 'Notre histoire', href: '/about' },
    { label: 'Nous contacter', href: '/contact' },
    { label: 'Suivi de commande', href: '/account/orders' },
    { label: 'Politique de retour', href: '/returns' },
  ],
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSent(true)
      setEmail('')
    }
  }

  return (
    <footer ref={ref} className="relative bg-[#09090b] text-white overflow-hidden">

      {/* Ligne dorée supérieure */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

      {/* Décoration fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-20">

        {/* ── ROW 1 : LOGO + NEWSLETTER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pb-16 border-b border-white/10">

          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link href="/" className="inline-flex flex-col mb-6">
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase">
                MAISON NIANG
              </span>
              <span className="text-[9px] tracking-[0.4em] text-[#c9a84c] uppercase mt-1">
                Saint-Louis · Paris · EST. 2024
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-8">
              La mode qui honore deux cultures. Des pièces créées pour ceux qui
              portent leur richesse intérieure avec fierté et élégance.
            </p>

            {/* Coordonnées */}
            <div className="space-y-3">
              {[
                { icon: MapPin, text: 'Saint-Louis Balacoss, Rue Abba Mbaye, Sénégal' },
                { icon: Phone, text: '+221 78 173 79 59' },
                { icon: Mail, text: 'eniang68@gmail.com' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Icon size={13} className="text-[#c9a84c] shrink-0" />
                  <span className="text-white/40 text-xs">{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="text-[9px] tracking-[0.5em] text-[#c9a84c] uppercase font-bold mb-4">
              Restez connectés
            </p>
            <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase mb-3">
              Rejoignez<br />l'univers Maison Niang
            </h3>
            <p className="text-white/40 text-sm mb-8">
              Nouveautés, ventes privées et éditions exclusives — en avant-première.
            </p>

            {sent ? (
              <motion.div
                className="flex items-center gap-3 text-[#c9a84c]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="text-lg">✦</span>
                <p className="text-sm font-bold tracking-wide">
                  Merci ! Vous faites maintenant partie de la famille Maison Niang.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex gap-0 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="newsletter-input flex-1 text-sm"
                />
                <button
                  type="submit"
                  className="bg-[#c9a84c] text-[#09090b] px-6 py-4 text-xs font-black uppercase tracking-widest hover:bg-[#f0d080] transition-colors duration-300 shrink-0"
                >
                  Ok
                </button>
              </form>
            )}
          </motion.div>
        </div>

        {/* ── ROW 2 : LIENS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 py-16 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <p className="text-[9px] tracking-[0.4em] text-[#c9a84c] uppercase font-bold mb-6">Boutique</p>
            <ul className="space-y-3">
              {LINKS.shop.map(l => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/40 text-xs hover:text-[#c9a84c] transition-colors duration-300 hover:pl-1 block"
                    style={{ transition: 'all 0.3s ease' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <p className="text-[9px] tracking-[0.4em] text-[#c9a84c] uppercase font-bold mb-6">Informations</p>
            <ul className="space-y-3">
              {LINKS.info.map(l => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/40 text-xs hover:text-[#c9a84c] transition-colors duration-300 block"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <p className="text-[9px] tracking-[0.4em] text-[#c9a84c] uppercase font-bold mb-6">Suivez-nous</p>
            <div className="flex gap-4 mb-8">
              {[
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
                { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
                { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
                { icon: Mail, href: 'mailto:eniang68@gmail.com', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#c9a84c] hover:border-[#c9a84c] transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {['🔒 Paiement sécurisé', '🚚 Livraison express', '↩️ Retour gratuit'].map(badge => (
                <span
                  key={badge}
                  className="text-[9px] tracking-[0.15em] text-white/30 border border-white/10 px-3 py-1.5"
                >
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3 : BOTTOM ── */}
        <motion.div
          className="pt-10 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <p className="text-white/20 text-[10px] tracking-[0.15em]">
            &copy; {currentYear} Maison Niang — Tous droits réservés.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] tracking-[0.2em] text-white/20">Designé avec</span>
            <span className="text-[#c9a84c] mx-1">✦</span>
            <span className="text-[10px] tracking-[0.2em] text-white/20">à Paris & Dakar</span>
          </div>
        </motion.div>

      </div>
    </footer>
  )
}