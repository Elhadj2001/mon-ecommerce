import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

export interface CartItem {
  id: string
  name: string
  price: number
  images: string[] 
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
        // Génération de l'ID unique pour différencier les variantes (Taille/Couleur)
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
          toast.success("Quantité mise à jour")
        } else {
          set({ 
            items: [...currentItems, { ...data, cartId: newCartId }] 
          })
          toast.success("Produit ajouté au panier")
        }
      },

      removeItem: (cartId) => {
        set({ items: get().items.filter((item) => item.cartId !== cartId) })
        toast.error("Produit retiré")
      },

      updateQuantity: (cartId, quantity) => {
        const currentItems = get().items
        if (quantity <= 0) {
          set({ items: currentItems.filter((item) => item.cartId !== cartId) })
        } else {
          set({ items: currentItems.map((item) => 
             item.cartId === cartId ? { ...item, quantity } : item 
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