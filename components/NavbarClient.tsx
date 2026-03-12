'use client'

import Link from 'next/link'
import { Category } from '@prisma/client'
import CategoryMenu from './CategoryMenu'
import MobileNav from './MobileNav'
import NavbarActions from './NavbarActions'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface NavbarClientProps {
  categories: Category[]
}

export default function NavbarClient({ categories }: NavbarClientProps) {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastScroll, setLastScroll] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y < lastScroll || y < 80)
      setLastScroll(y)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [lastScroll])

  return (
    <motion.header
      className={`
        sticky top-0 z-50 transition-all duration-500
        ${scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm'
          : 'bg-background border-b border-border'
        }
      `}
      animate={{ y: visible ? 0 : -80 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* ── Scroll progress top stripe ── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── GAUCHE : Burger (Mobile) + Logo ── */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="lg:hidden">
              <MobileNav categories={categories} />
            </div>

            <Link href="/" className="flex flex-col leading-none group">
              <span className="text-[1.15rem] font-black tracking-[-0.03em] uppercase text-foreground group-hover:text-[#c9a84c] transition-colors duration-300">
                MAISON NIANG
              </span>
              <span className="text-[0.5rem] tracking-[0.3em] text-[#c9a84c]/70 uppercase hidden xl:block transition-opacity duration-300">
                Saint-Louis · Paris
              </span>
            </Link>
          </div>

          {/* ── CENTRE : Navigation desktop ── */}
          <nav className="hidden lg:flex items-center h-full gap-1 flex-1 mx-4">

            {/* Liens statiques */}
            <NavLink href="/products?sort=new">Nouveautés</NavLink>

            <span className="text-destructive font-black text-xs uppercase tracking-widest px-1">
              <NavLink href="/products?isPromo=true" accent>Promos</NavLink>
            </span>

            {/* Séparateur fin */}
            <div className="h-5 w-px bg-border mx-2 shrink-0" />

            {/* Menu de catégories déroulant */}
            <div className="flex items-center h-full overflow-hidden">
              <CategoryMenu categories={categories} />
            </div>
          </nav>

          {/* ── DROITE : Actions ── */}
          <div className="flex items-center shrink-0">
            <NavbarActions />
          </div>

        </div>
      </div>
    </motion.header>
  )
}

function NavLink({
  href,
  children,
  accent,
}: {
  href: string
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={`
        group relative inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md
        transition-all duration-200 whitespace-nowrap
        ${accent
          ? 'text-destructive hover:bg-destructive/8'
          : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
        }
      `}
    >
      {children}
      {/* Underline dorée au hover */}
      <span
        className={`
          absolute bottom-0 left-3 right-3 h-[1.5px] scale-x-0 group-hover:scale-x-100
          transition-transform duration-300 origin-left rounded-full
          ${accent ? 'bg-destructive' : 'bg-[#c9a84c]'}
        `}
      />
    </Link>
  )
}