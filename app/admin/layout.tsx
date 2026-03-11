'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft, BarChart3 } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

const navLinks = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-secondary/30">
      
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r border-border flex flex-col shrink-0">
        
        {/* Logo / En-tête */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-background" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Admin Panel</h2>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Gestionnaire</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bas de sidebar */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs text-muted-foreground font-medium">Mon compte</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au site
          </Link>
        </div>
      </aside>

      {/* Contenu Principal */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}