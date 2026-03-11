import * as z from "zod"

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().min(1).int(),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional()
})

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Le panier est vide")
})

export type CheckoutValues = z.infer<typeof checkoutSchema>
