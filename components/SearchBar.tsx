'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import axios from 'axios'

// 1. On définit la forme exacte des données reçues de l'API
interface SearchResult {
  id: string
  name: string
  images: string[]
  category: {
    name: string
  }
}

export default function SearchBar() {
  const [query, setQuery] = useState('')
  // 2. On dit à useState que c'est une liste de SearchResult
  const [results, setResults] = useState<SearchResult[]>([]) 
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const response = await axios.get(`/api/search?q=${query}`)
        setResults(response.data)
        setIsOpen(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchProducts, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query) {
      setIsOpen(false)
      router.push(`/search?q=${query}`)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-black transition-all text-sm outline-none"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        {loading && <Loader2 className="absolute right-3 top-2.5 animate-spin text-gray-400" size={18} />}
      </form>

      {/* Dropdown des résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white mt-2 shadow-xl rounded-2xl border border-gray-100 overflow-hidden z-50">
          {/* 3. Plus besoin de 'any' ici, TypeScript sait ce que c'est */}
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                router.push(`/products/${product.id}`)
                setIsOpen(false)
                setQuery('')
              }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left"
            >
              {/* On vérifie qu'il y a une image avant de l'afficher */}
              {product.images?.[0] && (
                <img src={product.images[0]} className="w-10 h-10 object-cover rounded" alt={product.name} />
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate text-black">{product.name}</p>
                <p className="text-xs text-gray-500">{product.category?.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}