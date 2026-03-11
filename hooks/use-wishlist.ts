import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

interface WishlistItem {
  id: string
  name: string
  price: number
  imageUrl: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.find((i) => i.id === item.id)
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) })
          toast('Retiré des favoris', { icon: '💔' })
        } else {
          set({ items: [...get().items, item] })
          toast.success('Ajouté aux favoris !', { icon: '❤️' })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      isInWishlist: (id) => {
        return !!get().items.find((i) => i.id === id)
      },

      clearWishlist: () => set({ items: [] }),
    }),
    { name: 'wishlist-storage' }
  )
)
