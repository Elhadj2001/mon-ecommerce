'use client'

import { useState, useEffect } from "react"
import CartButton from "./CartButton"
import { ThemeToggle } from "./ThemeToggle"
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { CommandMenu } from "./CommandMenu"
import { LogIn, Heart } from "lucide-react"
import Link from "next/link"
import { useWishlist } from "@/hooks/use-wishlist"

export default function NavbarActions() {
  const [isMounted, setIsMounted] = useState(false)
  const wishlist = useWishlist()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const wishlistCount = wishlist.items.length

  return (
    <div className="flex items-center gap-x-1 sm:gap-x-2 md:gap-x-4">
        <CommandMenu />
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Bouton Wishlist - Masqué sur mobile par défaut pour gain de place */}
        <Link
          href="/wishlist"
          className="relative hidden sm:flex w-9 h-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-secondary transition-all"
          aria-label="Mes favoris"
        >
          <Heart className="w-4 h-4 text-foreground" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>

        <CartButton />
        
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>

        <SignedOut>
            <SignInButton mode="modal">
                <button className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl border border-border bg-background hover:bg-secondary transition-all">
                    <LogIn className="w-4 h-4" />
                    <span>Connexion</span>
                </button>
            </SignInButton>
        </SignedOut>
    </div>
  )
}
