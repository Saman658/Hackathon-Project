"use client"

import * as React from "react"

export interface CartItem {
  productId: string
  name: string
  price: string
  image: string | null
  quantity: number
}

const EMPTY_CART: CartItem[] = []

interface CartContextType {
  items: CartItem[]
  cartCount: number
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

const CART_STORAGE_KEY = "nexus-store-cart"

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    )
  } catch {
    return []
  }
}

const cartExternalStore = {
  items: [] as CartItem[],
  listeners: new Set<() => void>(),
  
  getSnapshot() {
    return this.items
  },
  
  subscribe(listener: () => void) {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  },
  
  setItems(newItems: CartItem[] | ((prev: CartItem[]) => CartItem[])) {
    this.items = typeof newItems === "function" ? newItems(this.items) : newItems
    this.listeners.forEach((listener) => listener())
  },
}

const CartContext = React.createContext<CartContextType>({
  items: [],
  cartCount: 0,
  addToCart: () => {},
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = React.useSyncExternalStore(
    cartExternalStore.subscribe.bind(cartExternalStore),
    cartExternalStore.getSnapshot.bind(cartExternalStore),
    () => EMPTY_CART
  )

  React.useEffect(() => {
    cartExternalStore.setItems(loadCartFromStorage())
  }, [])

  const addToCart = React.useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    cartExternalStore.setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId)
      if (existing) {
        return prev.map((p) =>
          p.productId === item.productId
            ? { ...p, quantity: Math.min(p.quantity + quantity, 99) }
            : p
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    cartExternalStore.setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(quantity, 1), 99) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    cartExternalStore.setItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = React.useCallback(() => {
    cartExternalStore.setItems([])
  }, [])

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, cartCount, addToCart, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return React.useContext(CartContext)
}
