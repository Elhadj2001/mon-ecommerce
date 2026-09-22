import * as z from "zod"

export const promoCreateSchema = z
  .object({
    code: z.string().trim().min(2, "Code trop court").max(50).regex(/^[A-Z0-9_-]+$/i, "Code invalide"),
    discountPercent: z.coerce.number().int().min(1).max(100).optional().nullable(),
    discountAmount: z.coerce.number().min(0.01).optional().nullable(),
    minOrderAmount: z.coerce.number().min(0).optional().nullable(),
    maxUses: z.coerce.number().int().min(1).max(100000).default(100),
    expiresAt: z.string().datetime().optional().nullable(),
  })
  .refine((d) => d.discountPercent || d.discountAmount, {
    message: "Spécifiez un pourcentage ou un montant de réduction",
    path: ['discountPercent'],
  })

export const promoValidateSchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.coerce.number().min(0),
})

export type PromoCreateValues = z.infer<typeof promoCreateSchema>
export type PromoValidateValues = z.infer<typeof promoValidateSchema>
