'use client'

import { useState } from "react"
import { Category } from "@prisma/client"
import Link from "next/link"
import { Menu, X, ChevronRight, User, Package, Heart, Tag, Sparkles } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface MobileNavProps {
  categories: Category[]
}

export default function MobileNav({ categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'Femme' | 'Homme'>('Femme')

  const close = () => setIsOpen(false)

  return (
    <>
      {/* BOUTON HAMBURGER */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-1 text-foreground hover:bg-secondary rounded-xl transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          onClick={close}
        />
      )}

      {/* DRAWER */}
      <div className={`
        fixed top-0 left-0 h-full w-[88%] max-w-[340px] z-[110]
        bg-background shadow-2xl border-r border-border
        flex flex-col transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* EN-TÊTE */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div>
            <span className="text-base font-black uppercase tracking-tight text-foreground">Maison Niang</span>
            <p className="text-[9px] text-[#c9a84c] tracking-[0.25em] uppercase">Saint-Louis · Paris</p>
          </div>
          <button
            onClick={close}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ONGLETS HOMME / FEMME */}
        <div className="grid grid-cols-2 border-b border-border flex-shrink-0">
          {(['Femme', 'Homme'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => setActiveTab(gender)}
              className={`
                py-3.5 text-xs font-black uppercase tracking-widest transition-all
                ${activeTab === gender
                  ? 'text-foreground border-b-2 border-foreground bg-secondary/50'
                  : 'text-muted-foreground border-b-2 border-transparent hover:text-foreground'
                }
              `}
            >
              {gender}
            </button>
          ))}
        </div>

        {/* CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* Liens rapides */}
          <div className="px-4 py-5 space-y-1">
            <Link
              href={`/products?sort=new&gender=${activeTab}`}
              onClick={close}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center">
                  <Sparkles size={15} className="text-foreground" />
                </div>
                <span className="text-sm font-bold text-foreground uppercase tracking-wide">Nouveautés</span>
              </div>
              <ChevronRight size={15} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>

            <Link
              href={`/products?isPromo=true&gender=${activeTab}`}
              onClick={close}
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Tag size={15} className="text-destructive" />
                </div>
                <span className="text-sm font-bold text-destructive uppercase tracking-wide">Promotions</span>
              </div>
              <ChevronRight size={15} className="text-muted-foreground group-hover:text-destructive transition-colors" />
            </Link>
          </div>

          {/* Séparateur */}
          <div className="px-4">
            <div className="h-px bg-border" />
          </div>

          {/* Catégories */}
          <div className="px-4 py-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-3 px-3">
              Rayons {activeTab}
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.id}?gender=${activeTab}`}
                  onClick={close}
                  className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary transition-colors group"
                >
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <ChevronRight size={14} className="text-border group-hover:text-foreground transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* PIED DE PAGE */}
        <div className="px-4 py-4 border-t border-border flex-shrink-0 space-y-1">
          <Link
            href="/wishlist"
            onClick={close}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Heart size={16} />
            <span>Mes Favoris</span>
          </Link>
          <Link
            href="/account/orders"
            onClick={close}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Package size={16} />
            <span>Mes Commandes</span>
          </Link>
          <Link
            href="/sign-in"
            onClick={close}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <User size={16} />
            <span>Connexion / Compte</span>
          </Link>
          <div className="flex items-center justify-between px-3 pt-2 border-t border-border mt-1">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Thème</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  )
}