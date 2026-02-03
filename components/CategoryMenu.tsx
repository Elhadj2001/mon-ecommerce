'use client'

import Link from "next/link"
import { Category } from "@prisma/client"
import { useState } from "react"

interface CategoryMenuProps {
  categories: Category[]
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const closeMenu = () => setActiveMenu(null)

  return (
    <div className="h-full flex items-center justify-start gap-8" onMouseLeave={closeMenu}>
      
      {/* 1. SEULEMENT LES DÉCLENCHEURS DU MEGA MENU (HOMME / FEMME) */}
      {['Femme', 'Homme'].map((gender) => (
        <div 
          key={gender} 
          className="h-full flex items-center"
          onMouseEnter={() => setActiveMenu(gender)}
        >
          <button 
            className={`
              text-xs xl:text-sm font-bold uppercase tracking-widest py-4 border-b-2 transition-all whitespace-nowrap
              ${activeMenu === gender ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black'}
            `}
          >
            {gender}
          </button>
        </div>
      ))}

      {/* 2. LE PANNEAU DÉROULANT (Reste identique) */}
      {activeMenu && (
        <div 
          className="fixed top-16 left-0 w-full bg-white border-t border-gray-200 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={closeMenu}
        >
          <div className="mx-auto max-w-7xl px-8 py-10">
            <div className="grid grid-cols-12 gap-8">
              
              {/* COLONNE 1 : À LA UNE */}
              <div className="col-span-3 border-r border-gray-100 pr-6">
                <h3 className="font-black text-lg uppercase mb-4 tracking-tighter">{activeMenu}</h3>
                <ul className="space-y-3">
                  <li><Link href={`/products?sort=new&gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-medium hover:underline block">Nouveautés</Link></li>
                  <li><Link href={`/products?isPromo=true&gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline block">Promotions</Link></li>
                  <li><Link href={`/products?gender=${activeMenu}`} onClick={closeMenu} className="text-sm font-medium text-gray-500 hover:text-black hover:underline block mt-4">Tout voir</Link></li>
                </ul>
              </div>

              {/* COLONNE 2 : CATÉGORIES */}
              <div className="col-span-6 px-6">
                 <h3 className="font-bold text-gray-400 text-xs uppercase mb-4 tracking-widest">Vêtements & Accessoires</h3>
                 <ul className="grid grid-cols-2 gap-y-2 gap-x-4">
                    {categories.map((cat) => (
                      <li key={cat.id}>
                        <Link href={`/category/${cat.id}?gender=${activeMenu}`} onClick={closeMenu} className="text-sm text-gray-600 hover:text-black hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors block">
                          {cat.name}
                        </Link>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* COLONNE 3 : IMAGE */}
              <div className="col-span-3">
                <div className="relative h-full w-full bg-gray-100 rounded-lg overflow-hidden group">
                   {/* eslint-disable-next-line @next/next/no-img-element */}
                   <img 
                      src={activeMenu === 'Homme' 
                        ? "https://images.unsplash.com/photo-1488161628813-994252600543?auto=format&fit=crop&w=500&q=80" 
                        : "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80"
                      }
                      alt={`Collection ${activeMenu}`}
                      className="object-cover w-full h-full opacity-90 group-hover:scale-105 transition-transform duration-500"
                   />
                   <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider">Collection {activeMenu}</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* FOND GRISÉ */}
      {activeMenu && (
        <div className="fixed inset-0 top-16 bg-black/25 z-40 backdrop-blur-[1px]" onMouseEnter={closeMenu} />
      )}
    </div>
  )
}