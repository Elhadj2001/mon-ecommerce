'use client'

import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary'
import { ImagePlus, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'

// Définition des types
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
  
  // Important : Permet d'éviter les erreurs d'hydratation avec le Widget Cloudinary
  // ...
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMounted(true)
    }, [])

    if (!isMounted) return null
    // ...

  // Typage strict du résultat de Cloudinary
  const onUpload = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object' && 'secure_url' in result.info) {
       const secureUrl = (result.info as { secure_url: string }).secure_url
       // Ajout de l'image (couleur null par défaut)
       onChange([...value, { url: secureUrl, color: null }])
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

  // Si on n'est pas encore monté (côté serveur), on n'affiche rien pour éviter les bugs
  if (!isMounted) return null

  return (
    <div className="mb-4">
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((image) => (
          <div key={image.url} className="relative w-[200px] bg-gray-50 border rounded-md p-2 shadow-sm">
            
            {/* Bouton Supprimer */}
            <div className="absolute z-10 top-0 right-0">
              <button
                type="button"
                onClick={() => onRemove(image.url)}
                className="bg-red-500 text-white p-1.5 rounded-bl-md hover:bg-red-600 transition"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>

            {/* IMAGE (Utilisation de <img> standard pour éviter les erreurs de config Next.js) */}
            <div className="relative w-full h-[200px] mb-2 rounded-md overflow-hidden border border-gray-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="object-cover w-full h-full"
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
                <option value="all">🌍 Toutes les couleurs</option>
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
        onSuccess={onUpload} 
        uploadPreset="ecommerce_preset" // Assure-toi que c'est le bon preset
        options={{
          multiple: true,
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