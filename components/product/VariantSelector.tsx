'use client'

import { useState } from 'react'

interface VariantSelectorProps {
  options: string // La chaine brute ex: "S, M, L"
  type: 'size' | 'color'
  onSelect: (value: string) => void
}

export default function VariantSelector({ options, type, onSelect }: VariantSelectorProps) {
  const [selected, setSelected] = useState('')
  
  // On transforme "S, M, L" en tableau ["S", "M", "L"] en enlevant les espaces
  const values = options.split(',').map(v => v.trim()).filter(v => v !== '')

  if (values.length === 0) return null

  const handleSelect = (val: string) => {
    setSelected(val)
    onSelect(val)
  }

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
        {type === 'size' ? 'Choisir la taille' : 'Choisir la couleur'}
      </h3>
      <div className="flex flex-wrap gap-3">
        {values.map((val) => {
          const isSelected = selected === val
          
          // Design différent pour Couleur (Rond) et Taille (Carré)
          if (type === 'color') {
            return (
              <button
                key={val}
                onClick={() => handleSelect(val)}
                className={`px-4 py-2 text-sm border rounded-full transition-all
                  ${isSelected 
                    ? 'border-black bg-black text-white ring-2 ring-offset-2 ring-gray-200' 
                    : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                  }`}
              >
                {val}
              </button>
            )
          }

          // Design pour Taille
          return (
            <button
              key={val}
              onClick={() => handleSelect(val)}
              className={`min-w-[3rem] h-12 flex items-center justify-center text-sm font-bold border rounded-md transition-all
                ${isSelected 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-200 bg-white text-gray-900 hover:border-black'
                }`}
            >
              {val}
            </button>
          )
        })}
      </div>
    </div>
  )
}