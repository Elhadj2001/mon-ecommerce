import * as z from "zod"

export const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z.string().min(10, "La description est trop courte"),
  price: z.coerce.number().min(0.01, "Le prix doit être supérieur à 0"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  originalPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, "Le stock ne peut pas être négatif"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  gender: z.string().default("Unisexe"),
  images: z.object({ url: z.string() }).array(),
})

export type ProductFormValues = z.infer<typeof productSchema>
