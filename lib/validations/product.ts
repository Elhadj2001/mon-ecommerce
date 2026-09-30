import * as z from "zod"

export const productImageSchema = z.object({
  url: z.string().min(1),
  color: z.string().optional().nullable(),
})

// Base sans refinement : Zod 4 interdit .partial() sur un schéma raffiné,
// la règle du prix barré est donc appliquée à chaque schéma exporté.
const productBaseSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(200),
  description: z.string().min(10, "La description est trop courte").max(5000),
  price: z.coerce.number().min(0.01, "Le prix doit être supérieur à 0"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  isFreeShipping: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  gender: z.string().default("Unisexe"),
  images: z.array(productImageSchema).min(1, "Au moins une image requise"),
})

// Un prix barré n'a de sens que s'il est supérieur au prix de vente
const originalPriceAbovePrice = (data: { price?: number; originalPrice?: number | null }) =>
  !data.originalPrice || data.price === undefined || data.originalPrice > data.price

const originalPriceError = {
  message: "Le prix barré doit être supérieur au prix de vente. Laissez-le vide s'il n'y a pas de promotion.",
  path: ['originalPrice'],
}

export const productSchema = productBaseSchema.refine(originalPriceAbovePrice, originalPriceError)

export const productUpdateSchema = productBaseSchema.partial().extend({
  images: z.array(productImageSchema).optional(),
}).refine(originalPriceAbovePrice, originalPriceError)

export type ProductFormValues = z.infer<typeof productSchema>
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>
