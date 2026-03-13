"use client"

import { CldImage } from "next-cloudinary"
import Image from "next/image"

interface CustomImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export function CustomImage({ src, alt, fill, width, height, className, sizes, priority }: CustomImageProps) {
  // on s'assure que si c'est une image cloudinary, on extrait le publicId, sinon on la passe telle quelle à un <img> fallback
  const isCloudinaryUrl = src.includes("res.cloudinary.com")
  const isLocalPath = src.startsWith("/") || src.startsWith("./")
  
  // Extraction robuste du public ID depuis une URL Cloudinary complète
  const getPublicId = (url: string) => {
    try {
      // Les URLs Cloudinary ont typiquement ce format: 
      // https://res.cloudinary.com/<cloud_name>/image/upload/[v<version>/]<public_id>.[ext]
      // L'expression régulière cherche "/upload/" suivi optionnellement d'une version "v1234/"
      const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/)
      
      if (uploadMatch && uploadMatch[1]) {
        return uploadMatch[1] // Renvoie le public ID complet (ex: "ecommerce/hq_image") sans l'extension
      }
      return url
    } catch {
      return url
    }
  }

  const imageSrc = isCloudinaryUrl ? getPublicId(src) : src

  if (isCloudinaryUrl || (!src.startsWith("http") && !isLocalPath)) {
    return (
      <CldImage
        src={imageSrc}
        alt={alt || "Image du produit"}
        fill={fill}
        width={width || (fill ? undefined : 800)}
        height={height || (fill ? undefined : 800)}
        className={className}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIgLz48L3N2Zz4=" // Un fond gris très léger et encodé nativement
        priority={priority}
      />
    )
  }

  // Fallback pour les images externes (comme placeholder.png ou images unsplash)
  return (
    <Image 
      src={src} 
      alt={alt || "Image"} 
      fill={fill}
      width={fill ? undefined : (width || 800)}
      height={fill ? undefined : (height || 800)}
      className={className} 
      sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
      priority={priority}
      style={fill ? { objectFit: 'cover' } : undefined}
    />
  )
}
