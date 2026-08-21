"use client"

import * as React from "react"
import type { Store } from "@/lib/data/stores"
import { stores as initialStores, generateStoreId } from "@/lib/data/stores"

interface StoresContextType {
  stores: Store[]
  addStore: (store: Omit<Store, "id">) => Store
}

const StoresContext = React.createContext<StoresContextType>({
  stores: initialStores,
  addStore: () => ({ id: "", name: "", slug: "", description: "", logo: "", heroTitle: "", heroDescription: "" }),
})

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = React.useState<Store[]>(initialStores)

  const addStore = React.useCallback((store: Omit<Store, "id">) => {
    const newStore: Store = {
      ...store,
      id: generateStoreId(),
    }
    setStores((prev) => [newStore, ...prev])
    return newStore
  }, [])

  return (
    <StoresContext.Provider value={{ stores, addStore }}>
      {children}
    </StoresContext.Provider>
  )
}

export function useStores() {
  const context = React.useContext(StoresContext)
  if (!context) {
    throw new Error("useStores must be used within a StoresProvider")
  }
  return context
}
