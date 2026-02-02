'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { ImagePlus, Trash } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

interface ImageValue {
  url: string
  color?: string | null
}

interface ImageUploadProps {
  disabled?: boolean
  onChange: (value: ImageValue[]) => void
  onRemove: (url: string) => void
  value: ImageValue[]
  availableColors: string[]
}

export default function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
  availableColors
}: ImageUploadProps) {
  
  const [isMounted, setIsMounted] = useState(false)
  
  // --- FIX BUG MULTIPLE IMAGES ---
  // On utilise une Ref pour stocker la valeur "réelle" instantanée
  // car l'état React 'value' est trop lent à se mettre à jour lors d'un upload multiple
  const valueRef = useRef(value)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // On garde la Ref synchronisée avec la valeur du parent à chaque rendu
  useEffect(() => {
    valueRef.current = value
  }, [value])

  if (!isMounted) return null

  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    // On vérifie strictement que l'upload est un succès
    if (result.event === 'success' && result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
       const secureUrl = (result.info as { secure_url: string }).secure_url
       
       // FIX : On utilise valueRef.current au lieu de value pour avoir la liste à jour
       const currentImages = valueRef.current
       
       // On évite les doublons (si Cloudinary renvoie deux fois le même event)
       if (!currentImages.find(img => img.url === secureUrl)) {
          onChange([...currentImages, { url: secureUrl, color: null }])
       }
    }
  }

  const onUpdateColor = (urlToUpdate: string, newColor: string) => {
    const updatedImages = value.map((img) => {
      if (img.url === urlToUpdate) {
        return { ...img, color: newColor === 'all' ? null : newColor }
      }
      return img
    })
    onChange(updatedImages)
  }

  return (
    <div className="mb-4">
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((image) => (
          <div key={image.url} className="relative w-[200px] bg-gray-50 border rounded-md p-2 shadow-sm group">
            
            {/* Bouton Supprimer */}
            <div className="absolute z-10 top-0 right-0">
              <button
                type="button"
                onClick={() => onRemove(image.url)}
                className="bg-red-500 text-white p-1.5 rounded-bl-md hover:bg-red-600 transition opacity-90 hover:opacity-100"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>

            {/* IMAGE */}
            <div className="relative w-full h-[200px] mb-2 rounded-md overflow-hidden border border-gray-200 bg-white">
              {/* Utilisation de object-contain pour voir l'image entière comme demandé */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="object-contain w-full h-full"
                alt="Image produit"
                src={image.url}
              />
            </div>

            {/* Sélecteur de Variante */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">
                Variante associée
              </label>
              <select
                disabled={disabled}
                value={image.color || 'all'}
                onChange={(e) => onUpdateColor(image.url, e.target.value)}
                className="w-full text-xs p-1.5 border rounded bg-white text-black font-medium focus:ring-1 focus:ring-black cursor-pointer"
              >
                <option value="all">🌍 Toutes</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    🎨 {color}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <CldUploadWidget 
        onSuccess={onUpload} // Note: on utilise onSuccess au lieu de onUpload pour la V6
        uploadPreset="ecommerce_preset" 
        options={{
          multiple: true, // Ceci cause le bug sans le useRef fix
          maxFiles: 10,
          resourceType: "image"
        }}
      >
        {({ open }) => {
          const onClick = () => {
            if (open) open()
          }

          return (
            <button
              type="button"
              disabled={disabled}
              onClick={onClick}
              className="flex flex-col items-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 px-4 py-8 rounded-lg hover:bg-gray-100 transition w-full justify-center font-semibold"
            >
              <ImagePlus className="h-6 w-6" />
              Ajouter des images
            </button>
          )
        }}
      </CldUploadWidget>
    </div>
  )
}