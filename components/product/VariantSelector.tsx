'use client'

import { useState } from 'react'

interface VariantSelectorProps {
  // CORRECTION ICI : On précise que options est un tableau de chaînes
  options: string[]; 
  type: 'size' | 'color';
  onSelect: (value: string) => void;
}

export default function VariantSelector({ options, type, onSelect }: VariantSelectorProps) {
  const [active, setActive] = useState('')

  const handleSelect = (val: string) => {
    setActive(val)
    onSelect(val)
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
        {type === 'size' ? 'Taille' : 'Couleur'}
      </h3>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            className={`
              px-4 py-2 border rounded-md text-sm font-medium transition-all uppercase
              ${active === option 
                ? 'border-black bg-black text-white' 
                : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'}
            `}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}