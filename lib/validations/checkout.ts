import * as z from "zod"

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
  selectedSize: z.string().optional(),
  selectedColor: z.string().optional(),
})

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Le panier est vide").max(50),
})

export type CheckoutValues = z.infer<typeof checkoutSchema>

export const PAYMENT_METHODS = ['WAVE', 'ORANGE_MONEY', 'CASH_ON_DELIVERY', 'PAYPAL'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const customerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  phone: z.string().min(6, "Numéro invalide").max(30),
  email: z.email().optional().or(z.literal('')),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
})

export const customCheckoutSchema = z
  .object({
    items: z.array(checkoutItemSchema).min(1).max(50),
    customer: customerSchema,
    paymentMethod: z.enum(PAYMENT_METHODS),
    promoCode: z.string().trim().min(1).max(50).optional().nullable(),
    discount: z.number().min(0).optional(),
    shippingCost: z.number().min(0).optional(),
  })
  .refine(
    (data) => data.paymentMethod !== 'CASH_ON_DELIVERY' || (data.customer.address && data.customer.address.length > 0),
    { message: "Adresse requise pour le paiement à la livraison", path: ['customer', 'address'] },
  )

export type CustomCheckoutValues = z.infer<typeof customCheckoutSchema>
