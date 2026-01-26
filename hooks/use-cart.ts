import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'react-hot-toast' // L'erreur disparaîtra car on l'utilise plus bas

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  selectedSize?: string
  selectedColor?: string
  cartId: string
}

interface CartStore {
  items: CartItem[]
  addItem: (data: Omit<CartItem, 'cartId'>) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      
      addItem: (data) => {
        const currentItems = get().items
        const newCartId = `${data.id}-${data.selectedSize || ''}-${data.selectedColor || ''}`
        const existingItem = currentItems.find((item) => item.cartId === newCartId)

        if (existingItem) {
          set({
            items: currentItems.map((item) => 
              item.cartId === newCartId 
                ? { ...item, quantity: item.quantity + data.quantity } 
                : item
            )
          })
          // On utilise toast ici !
          toast.success("Quantité mise à jour dans le panier")
        } else {
          set({ 
            items: [...get().items, { ...data, cartId: newCartId }] 
          })
          // Et ici !
          toast.success("Produit ajouté au panier")
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.cartId !== id) })
        toast.error("Produit retiré")
      },

      updateQuantity: (id, quantity) => {
        const currentItems = get().items
        if (quantity <= 0) {
          set({ items: currentItems.filter((item) => item.cartId !== id) })
        } else {
          set({ items: currentItems.map((item) => 
             item.cartId === id ? { ...item, quantity } : item 
          )})
        }
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)