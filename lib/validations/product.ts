import * as z from "zod"

export const productImageSchema = z.object({
  url: z.string().min(1),
  color: z.string().optional().nullable(),
})

export const productSchema = z.object({
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

export const productUpdateSchema = productSchema.partial().extend({
  images: z.array(productImageSchema).optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
export type ProductUpdateValues = z.infer<typeof productUpdateSchema>
