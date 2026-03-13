'use client'

import { useState } from "react"
import { Category } from "@prisma/client"
import Link from "next/link"
import { Menu, X, ChevronRight, User, Package } from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

interface MobileNavProps {
  categories: Category[]
}

export default function MobileNav({ categories }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'Femme' | 'Homme'>('Femme')

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* BOUTON HAMBURGER (Visible uniquement sur mobile) */}
      <button
        onClick={toggleMenu}
        className="p-2 -ml-2 text-foreground hover:opacity-80 md:hidden transition-opacity"
        aria-label="Menu"
      >
        <Menu size={24} />
      </button>

      {/* OVERLAY SOMBRE (Fond) */}
      <div
        className={`
            fixed inset-0 bg-black/50 z-50 backdrop-blur-sm transition-opacity duration-300
            ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}
        `}
        onClick={toggleMenu}
      />

      {/* LE MENU LATÉRAL (DRAWER) */}
      <div className={`
        fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#111113] z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* 1. EN-TÊTE DU MENU */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
           <span className="text-xl font-black uppercase tracking-tighter text-foreground">Maison Niang</span>
           <button onClick={toggleMenu} className="p-2 text-gray-500 hover:text-foreground">
             <X size={24} />
           </button>
        </div>

        {/* 2. ONGLETS HOMME / FEMME (Style App Native) */}
        <div className="grid grid-cols-2 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            {['Femme', 'Homme'].map((gender) => (
                <button
                    key={gender}
                    onClick={() => setActiveTab(gender as 'Femme' | 'Homme')}
                    className={`
                        py-4 text-sm font-bold uppercase tracking-widest transition-colors
                        ${activeTab === gender
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-muted-foreground border-b-2 border-transparent hover:text-foreground/70'}
                    `}
                >
                    {gender}
                </button>
            ))}
        </div>

        {/* 3. LISTE DES LIENS (Scrollable) */}
        <div className="overflow-y-auto flex-1 py-6 px-6 space-y-6">

            {/* Liens rapides (Nouveautés / Promos) */}
            <div className="space-y-4">
                <Link
                    href={`/products?sort=new&gender=${activeTab}`}
                    onClick={toggleMenu}
                    className="flex items-center justify-between text-base font-bold text-foreground uppercase group"
                >
                    Nouveautés
                    <ChevronRight size={18} className="text-transparent group-hover:text-foreground transition-colors" />
                </Link>
                <Link
                    href={`/products?isPromo=true&gender=${activeTab}`}
                    onClick={toggleMenu}
                    className="flex items-center justify-between text-base font-bold text-red-600 uppercase group"
                >
                    Promotions
                    <ChevronRight size={18} className="text-transparent group-hover:text-red-600 transition-colors" />
                </Link>
            </div>

            <hr className="border-gray-100 dark:border-gray-800" />

            {/* Catégories Dynamiques */}
            <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Catégories {activeTab}
                </p>
                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/category/${cat.id}?gender=${activeTab}`}
                        onClick={toggleMenu}
                        className="flex items-center justify-between py-3 text-sm font-medium text-foreground/80 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:pl-2 transition-all group"
                    >
                        {cat.name}
                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </Link>
                ))}
            </div>
        </div>

        {/* 4. BAS DE PAGE (Compte + Thème + Commandes) */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#0d0d0f] flex-shrink-0 space-y-3">
             <Link href="/account/orders" onClick={toggleMenu} className="flex items-center gap-3 text-sm font-bold uppercase text-muted-foreground hover:text-foreground transition-colors">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-border">
                    <Package size={18} />
                </div>
                <span>Mes commandes</span>
             </Link>
             <Link href="/sign-in" onClick={toggleMenu} className="flex items-center gap-3 text-sm font-bold uppercase text-muted-foreground hover:text-foreground transition-colors">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full border border-border">
                    <User size={18} />
                </div>
                <span>Se connecter / Compte</span>
             </Link>
             <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Thème</span>
                <ThemeToggle />
             </div>
        </div>

      </div>
    </>
  )
}