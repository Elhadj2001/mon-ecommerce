"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Search, Loader2 } from "lucide-react"
import { CustomImage } from "@/components/ui/CustomImage"
import { formatPrice } from "@/lib/currency"
import { useDebounce } from "@/hooks/use-debounce"
import { DialogTitle } from "@radix-ui/react-dialog"

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<any[]>([])
  const router = useRouter()

  const debouncedSearch = useDebounce(search, 300)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    if (!debouncedSearch || debouncedSearch.length < 2) {
      setResults([])
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
        const data = await res.json()
        setResults(data)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [debouncedSearch])

  const onSelect = (id: string) => {
    setOpen(false)
    setSearch("")
    router.push(`/products/${id}`)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/50 hover:bg-secondary rounded-md border border-border w-64 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Recherche...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <button 
        onClick={() => setOpen(true)}
        className="md:hidden p-2 text-foreground hover:bg-accent rounded-full transition"
      >
        <Search size={22} />
      </button>

      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen}
        label="Recherche globale"
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-start justify-center pt-[20vh] sm:pt-[10vh]"
      >
        <DialogTitle className="sr-only">Menu de recherche temporelle</DialogTitle>
        <div className="relative w-full max-w-2xl bg-popover text-popover-foreground shadow-2xl rounded-xl border border-border overflow-hidden ring-1 ring-border shadow-black/10 mx-4">
            
            <div className="flex items-center px-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground mr-2 shrink-0" />
                <Command.Input 
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Rechercher vêtements, accessoires, collections..."
                    className="w-full bg-transparent outline-none border-none py-4 text-base placeholder:text-muted-foreground focus:ring-0"
                />
                {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            <Command.List className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    {search.length < 2 
                        ? "Commencez à taper pour rechercher..." 
                        : "Aucun produit trouvé."}
                </Command.Empty>

                {results.length > 0 && (
                    <Command.Group heading="Produits" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                        {results.map((product) => (
                            <Command.Item
                                key={product.id}
                                onSelect={() => onSelect(product.id)}
                                value={product.name}
                                className="flex items-center gap-4 px-2 py-3 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground mt-1 group"
                            >
                                <div className="h-12 w-12 rounded bg-secondary relative overflow-hidden flex-shrink-0">
                                    {/* Si l'API renvoie des images, sinon un placeholder */}
                                    {product.images?.[0] ? (
                                        <CustomImage src={product.images[0].url} alt={product.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-secondary">
                                            <Search className="w-4 h-4 text-muted-foreground opacity-50" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 text-sm">
                                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                        {product.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {product.category?.name || "Catégorie"}
                                    </span>
                                </div>
                                <div className="font-bold text-sm text-foreground pr-2">
                                    {formatPrice(Number(product.price))}
                                </div>
                            </Command.Item>
                        ))}
                    </Command.Group>
                )}
            </Command.List>

        </div>
      </Command.Dialog>
    </>
  )
}
