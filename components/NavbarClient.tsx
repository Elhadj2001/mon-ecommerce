'use client'

import Link from 'next/link'
import { Category } from '@prisma/client'
import CategoryMenu from './CategoryMenu'
import MobileNav from './MobileNav'
import NavbarActions from './NavbarActions'

interface NavbarClientProps {
  categories: Category[]
}

export default function NavbarClient({ categories }: NavbarClientProps) {
  return (
    <header className="border-b bg-white sticky top-0 z-50 h-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full">
        
        {/* GRILLE À 4 ZONES (12 colonnes au total) */}
        <div className="grid grid-cols-12 h-full items-center gap-4">
          
          {/* ZONE 1 : LOGO (2 colonnes) */}
          <div className="col-span-2 flex items-center gap-2">
             <div className="lg:hidden">
                <MobileNav categories={categories} />
             </div>
             <Link href="/" className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tighter uppercase">MONSOON</span>
                <span className="text-[0.6rem] tracking-[0.2em] text-gray-500 uppercase hidden xl:block">Paris · Dakar</span>
             </Link>
          </div>

          {/* ZONE 2 : LIENS STATIQUES (3 colonnes) - Nouveautés / Promos */}
          <div className="col-span-3 hidden lg:flex items-center justify-start gap-6">
              <Link 
                href="/products?sort=new" 
                className="text-xs xl:text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors whitespace-nowrap"
              >
                Nouveautés
              </Link>
              <Link 
                href="/products?isPromo=true" 
                className="text-xs xl:text-sm font-bold uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
              >
                Promotions
              </Link>
          </div>

          {/* ZONE 3 : MENU DÉROULANT (5 colonnes) - Homme / Femme */}
          {/* On utilise border-l (ligne verticale) pour séparer visuellement la zone 2 et 3 */}
          <div className="col-span-5 hidden lg:flex justify-start h-full items-center pl-6 border-l border-gray-100">
              <CategoryMenu categories={categories} />
          </div>

          {/* ZONE 4 : ACTIONS (2 colonnes) - Recherche / Panier */}
          <div className="col-span-2 flex items-center justify-end h-full">
              <NavbarActions />
          </div>

        </div>
      </div>
    </header>
  )
}