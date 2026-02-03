'use client'

import { useState } from "react"
import { Category } from "@prisma/client"
import Link from "next/link"
import { Menu, X, ChevronRight, User } from "lucide-react"

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
        className="p-2 -ml-2 text-black hover:text-gray-600 md:hidden"
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
        fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* 1. EN-TÊTE DU MENU */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
           <span className="text-xl font-black uppercase tracking-tighter">Monsoon</span>
           <button onClick={toggleMenu} className="p-2 text-gray-500 hover:text-black">
             <X size={24} />
           </button>
        </div>

        {/* 2. ONGLETS HOMME / FEMME (Style App Native) */}
        <div className="grid grid-cols-2 border-b border-gray-100 flex-shrink-0">
            {['Femme', 'Homme'].map((gender) => (
                <button
                    key={gender}
                    onClick={() => setActiveTab(gender as 'Femme' | 'Homme')}
                    className={`
                        py-4 text-sm font-bold uppercase tracking-widest transition-colors
                        ${activeTab === gender 
                            ? 'text-black border-b-2 border-black' 
                            : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'}
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
                    // Lien intelligent : Nouveautés + Filtre Genre actif
                    href={`/products?sort=new&gender=${activeTab}`} 
                    onClick={toggleMenu} 
                    className="flex items-center justify-between text-base font-bold text-black uppercase group"
                >
                    Nouveautés
                    <ChevronRight size={18} className="text-transparent group-hover:text-black transition-colors" />
                </Link>
                <Link 
                    // Lien intelligent : Promos + Filtre Genre actif
                    href={`/products?isPromo=true&gender=${activeTab}`} 
                    onClick={toggleMenu} 
                    className="flex items-center justify-between text-base font-bold text-red-600 uppercase group"
                >
                    Promotions
                    <ChevronRight size={18} className="text-transparent group-hover:text-red-600 transition-colors" />
                </Link>
            </div>

            <hr className="border-gray-100" />

            {/* Catégories Dynamiques */}
            <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Catégories {activeTab}
                </p>
                {categories.map((cat) => (
                    <Link 
                        key={cat.id}
                        href={`/category/${cat.id}?gender=${activeTab}`} // On utilise l'onglet actif pour le filtre
                        onClick={toggleMenu}
                        className="flex items-center justify-between py-3 text-sm font-medium text-gray-800 border-b border-gray-50 last:border-0 hover:pl-2 transition-all group"
                    >
                        {cat.name}
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-black transition-colors" />
                    </Link>
                ))}
            </div>
        </div>

        {/* 4. BAS DE PAGE (Compte) */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
             <Link href="/sign-in" onClick={toggleMenu} className="flex items-center gap-3 text-sm font-bold uppercase text-gray-700 hover:text-black transition-colors">
                <div className="p-2 bg-white rounded-full border border-gray-200">
                    <User size={18} />
                </div>
                <span>Se connecter / Compte</span>
             </Link>
        </div>

      </div>
    </>
  )
}