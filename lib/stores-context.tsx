"use client"

import * as React from "react"
import type { Store } from "@/lib/data/stores"
import { generateStoreId, getStoresFromSupabase } from "@/lib/data/stores"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"

interface StoresContextType {
  stores: Store[]
  addStore: (store: Omit<Store, "id"> & { userId?: string }) => Promise<Store | null>
  updateStore: (store: Store) => Promise<Store | null>
  loading: boolean
}

const StoresContext = React.createContext<StoresContextType>({
  stores: [],
  addStore: async () => null,
  updateStore: async () => null,
  loading: true,
})

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = React.useState<Store[]>([])
  const [loading, setLoading] = React.useState(true)
  const { user } = useAuth()

  React.useEffect(() => {
    async function load() {
      if (!user?.id) {
        setStores([])
        setLoading(false)
        return
      }
      const data = await getStoresFromSupabase(user.id)
      setStores(data)
      setLoading(false)
    }
    load()
  }, [user?.id])

  const addStore = React.useCallback(async (store: Omit<Store, "id"> & { userId?: string }) => {
    const supabase = createClient()
    const slug = store.slug || generateStoreId()
    const userId = store.userId || user?.id || ""

    if (!userId) {
      throw new Error("You must be logged in to create a store")
    }

    const { data, error } = await supabase
      .from("stores")
      .insert({
        user_id: userId,
        name: store.name,
        slug: slug,
        description: store.description,
        logo: store.logo,
        hero_title: store.heroTitle,
        hero_description: store.heroDescription,
      })
      .select("*")
      .single()

    if (error || !data) {
      throw new Error(error?.message || "Failed to create store")
    }

    const newStore: Store = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      logo: data.logo || "",
      heroTitle: data.hero_title || "",
      heroDescription: data.hero_description || "",
      userId: data.user_id,
    }

    setStores((prev) => [newStore, ...prev])
    return newStore
  }, [user?.id])

  const updateStore = React.useCallback(async (store: Store) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("stores")
      .update({
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        hero_title: store.heroTitle,
        hero_description: store.heroDescription,
      })
      .eq("id", store.id)
      .select("*")
      .single()

    if (error || !data) {
      throw new Error(error?.message || "Failed to update store")
    }

    const updated: Store = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      logo: data.logo || "",
      heroTitle: data.hero_title || "",
      heroDescription: data.hero_description || "",
      userId: data.user_id,
    }

    setStores((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    return updated
  }, [])

  return (
    <StoresContext.Provider value={{ stores, addStore, updateStore, loading }}>
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
