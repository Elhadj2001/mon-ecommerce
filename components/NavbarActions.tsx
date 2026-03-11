'use client'

import { useState, useEffect } from "react"
import CartButton from "./CartButton"
import { ThemeToggle } from "./ThemeToggle"
import { UserButton, SignedIn } from "@clerk/nextjs"
import { CommandMenu } from "./CommandMenu"

export default function NavbarActions() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex items-center gap-x-2 md:gap-x-4">
        {/* Le CommandMenu gère son propre bouton (Desktop/Mobile) et sa modale */}
        <CommandMenu />

        <ThemeToggle />
        <CartButton />
        
        <SignedIn>
            <UserButton afterSignOutUrl="/" />
        </SignedIn>
    </div>
  )
}