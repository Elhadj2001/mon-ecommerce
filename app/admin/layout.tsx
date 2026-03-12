'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, ArrowLeft,
  TrendingUp, Settings, BellRing, ChevronRight, Menu, X
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'

const NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#f8f8f8] dark:bg-[#0d0d0f]">

      {/* OVERLAY MOBILE */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR PREMIUM
      ══════════════════════════════════════ */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#09090b] flex flex-col shrink-0 overflow-hidden transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>

        {/* Bouton fermeture mobile */}
        <button 
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-white/50 hover:text-white md:hidden z-50 p-2"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Décoration fond sidebar */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #c9a84c, transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        </div>

        {/* ── Logo / Brand ── */}
        <div className="relative p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-[#c9a84c] flex items-center justify-center shrink-0 rounded-sm">
              <TrendingUp className="w-4 h-4 text-[#09090b]" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight text-white leading-none">
                Maison Niang
              </h2>
              <p className="text-[9px] tracking-[0.25em] text-[#c9a84c] uppercase mt-0.5">
                Admin
              </p>
            </div>
          </Link>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 p-3 space-y-0.5">
          <p className="text-[9px] tracking-[0.35em] text-white/20 uppercase px-3 pt-3 pb-2">
            Navigation
          </p>
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`
                  relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold
                  transition-all duration-200 group
                  ${isActive
                    ? 'bg-[#c9a84c] text-[#09090b]'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-70" />}
              </Link>
            )
          })}
        </nav>

        {/* ── Bottom ── */}
        <div className="relative p-3 border-t border-white/[0.06] space-y-1">
          {/* Profil utilisateur */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <UserButton afterSignOutUrl="/" />
            <div>
              <p className="text-xs text-white/80 font-semibold">Mon compte</p>
              <p className="text-[9px] text-white/30 tracking-wider">Administrateur</p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top Bar ── */}
        <header className="h-14 bg-white dark:bg-[#111113] border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bouton Hamburger (Mobile uniquement) */}
            <button 
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-foreground hover:bg-secondary rounded-md"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / titre */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-bold text-foreground hidden sm:inline">Maison Niang</span>
              <ChevronRight className="w-3 h-3 hidden sm:inline" />
              <span className="capitalize font-bold sm:font-normal text-foreground sm:text-muted-foreground">
              {pathname === '/admin'
                ? 'Dashboard'
                : pathname.split('/').filter(Boolean).slice(1).join(' › ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicateur en direct */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En ligne
            </div>

            {/* Lien nouveau produit rapide */}
            <Link
              href="/admin/products/new"
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#c9a84c] text-[#09090b] text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md hover:bg-[#f0d080] transition-colors"
            >
              + Produit
            </Link>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}