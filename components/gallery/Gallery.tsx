'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Image as ImageType } from '@prisma/client'

interface GalleryProps {
  images: ImageType[]
}

export default function Gallery({ images }: GalleryProps) {
  // CORRECTION : Le Hook doit être TOUT EN HAUT, avant le "if"
  // On initialise avec la première image si elle existe, sinon null
  const [mainImage, setMainImage] = useState<ImageType | null>(images && images.length > 0 ? images[0] : null)

  // Maintenant qu'on a déclaré le hook, on peut faire le early return (vérification)
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium">
        Pas d&aposimage
      </div>
    )
  }

  // Logique pour s'assurer qu'on affiche une image valide
  // Si l'image principale sélectionnée (mainImage) n'est plus dans la liste filtrée (images),
  // alors on affiche par défaut la première image de la liste.
  const displayImage = mainImage && images.find(img => img.id === mainImage.id) 
    ? mainImage 
    : images[0]

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      
      {/* 1. Colonne des miniatures (Thumbnails) */}
      <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible w-full md:w-[100px] h-fit py-2 md:py-0">
        {images.map((image) => (
          <button
            key={image.id}
            onClick={() => setMainImage(image)}
            className={`
              relative w-[80px] h-[80px] rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all
              ${displayImage.id === image.id ? 'border-black ring-1 ring-black' : 'border-transparent hover:border-gray-200'}
            `}
          >
            <Image
              src={image.url}
              alt=""
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* 2. Grande Image Principale */}
      <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        <Image
          src={displayImage.url}
          alt="Produit"
          fill
          className="object-cover object-center"
          priority // Important pour le LCP (vitesse de chargement)
        />
      </div>
    </div>
  )
}