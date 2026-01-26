'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface PaginationProps {
  totalPages: number
}

export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    replace(`${pathname}?${params.toString()}`)
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        disabled={currentPage <= 1}
        onClick={() => createPageURL(currentPage - 1)}
        className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
      
      <span className="text-sm font-medium">
        Page {currentPage} sur {totalPages}
      </span>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => createPageURL(currentPage + 1)}
        className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </div>
  )
}