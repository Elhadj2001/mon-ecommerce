'use client'

import { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import SearchBar from "./SearchBar"
import CartButton from "./CartButton"
import { UserButton, SignedIn } from "@clerk/nextjs"

export default function NavbarActions() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Si la recherche mobile est ouverte, on affiche l'overlay
  if (isMobileSearchOpen) {
    return (
        <div className="fixed inset-0 top-0 h-16 bg-white z-[60] flex items-center px-4 w-full animate-in fade-in slide-in-from-top-2 duration-200 border-b">
            <div className="flex-1">
                <SearchBar />
            </div>
            <button 
                onClick={() => setIsMobileSearchOpen(false)} 
                className="ml-4 p-2 text-gray-500 hover:text-black bg-gray-100 rounded-full"
            >
                <X size={20} />
            </button>
        </div>
    )
  }

  return (
    <div className="flex items-center gap-x-4">
        {/* Barre de recherche Desktop (Toujours visible sur grand écran) */}
        <div className="hidden md:block w-64">
            <SearchBar />
        </div>

        {/* Loupe Mobile (Cachée sur desktop) */}
        <button 
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 text-black hover:bg-gray-100 rounded-full transition"
        >
            <Search size={22} />
        </button>

        <CartButton />
        
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>
    </div>
  )
}