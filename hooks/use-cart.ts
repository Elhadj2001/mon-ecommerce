import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'react-hot-toast'

export interface CartItem {
  id: string
  name: string
  price: number
  images: string[] 
  quantity: number
  stock: number // Ajout de la limite de stock
  selectedSize?: string
  selectedColor?: string
  cartId: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  addItem: (data: Omit<CartItem, 'cartId'>) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      isOpen: false,
      onOpen: () => set({ isOpen: true }),
      onClose: () => set({ isOpen: false }),
      
      addItem: (data) => {
        const currentItems = get().items
        // Génération de l'ID unique pour différencier les variantes (Taille/Couleur)
        const newCartId = `${data.id}-${data.selectedSize || ''}-${data.selectedColor || ''}`
        
        const existingItem = currentItems.find((item) => item.cartId === newCartId)

        if (existingItem) {
          // Bloquer si on dépasse le stock
          if (existingItem.quantity + data.quantity > data.stock) {
            set({
              items: currentItems.map((item) => 
                item.cartId === newCartId 
                  ? { ...item, quantity: data.stock } 
                  : item
              )
            })
            toast.error(`Stock maximum atteint (${data.stock} disponibles)`)
          } else {
            set({
              items: currentItems.map((item) => 
                item.cartId === newCartId 
                  ? { ...item, quantity: item.quantity + data.quantity } 
                  : item
              )
            })
            toast.success("Quantité mise à jour")
          }
        } else {
          // Bloquer d'emblée si quantity demandée > stock (rare mais au cas où)
          const validQuantity = Math.min(data.quantity, data.stock)
          if (validQuantity < data.quantity) {
             toast.error(`Stock limité à ${data.stock} articles`)
          } else {
             toast.success("Produit ajouté au panier")
          }
          
          set({ 
            items: [...currentItems, { ...data, cartId: newCartId, quantity: validQuantity }] 
          })
        }
        
        // Ouvrir le panier au moment de l'ajout
        get().onOpen()
      },

      removeItem: (cartId) => {
        set({ items: get().items.filter((item) => item.cartId !== cartId) })
      },

      updateQuantity: (cartId, quantity) => {
        const currentItems = get().items
        const itemToUpdate = currentItems.find((item) => item.cartId === cartId)
        
        if (!itemToUpdate) return;
        
        if (quantity <= 0) {
          set({ items: currentItems.filter((item) => item.cartId !== cartId) })
        } else if (quantity > itemToUpdate.stock) {
          toast.error(`Stock maximum atteint (${itemToUpdate.stock} disponibles)`)
          set({ items: currentItems.map((item) => 
             item.cartId === cartId ? { ...item, quantity: itemToUpdate.stock } : item 
          )})
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