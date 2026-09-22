import * as z from "zod"

export const reviewSchema = z.object({
  productId: z.string().min(1, "Produit requis"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Commentaire trop court").max(2000),
  authorName: z.string().min(2, "Nom trop court").max(80),
})

export type ReviewValues = z.infer<typeof reviewSchema>
