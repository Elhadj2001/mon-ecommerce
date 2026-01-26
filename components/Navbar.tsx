// components/Navbar.tsx
import Link from 'next/link'
import MainNav from './MainNav'
import CartButton from './CartButton' // On importe notre nouveau bouton client
import { UserButton, SignedIn } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-x-2">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tighter uppercase">MONSOON</span>
            <span className="text-[0.6rem] tracking-[0.2em] text-gray-500 uppercase">Paris · Dakar</span>
          </div>
        </Link>

        {/* MENU (Dynamique / Serveur) */}
        <MainNav />

        {/* BOUTON PANIER (Client) */}
        <div className="flex items-center gap-x-4">
            <CartButton />
            
            {/* Ce bloc ne s'affiche QUE si tu es connecté */}
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
        </div>
        
      </div>
    </header>
  )
}