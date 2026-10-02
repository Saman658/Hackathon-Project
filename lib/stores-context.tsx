"use client"

import * as React from "react"
import type { Store } from "@/lib/data/stores"
import { generateStoreId, getStoresFromSupabase } from "@/lib/data/stores"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/components/providers/auth-provider"

interface StoresContextType {
  stores: Store[]
  activeStoreId: string
  activeStore: Store | null
  setActiveStoreId: (storeId: string) => void
  addStore: (store: Omit<Store, "id"> & { userId?: string }) => Promise<Store | null>
  updateStore: (store: Store) => Promise<Store | null>
  loading: boolean
}

const ACTIVE_STORE_STORAGE_KEY = "nexus-active-store"

function readPersistedActiveStoreId(): string {
  if (typeof window === "undefined") return ""
  try {
    return window.localStorage.getItem(ACTIVE_STORE_STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

function persistActiveStoreId(storeId: string) {
  if (typeof window === "undefined") return
  try {
    if (storeId) {
      window.localStorage.setItem(ACTIVE_STORE_STORAGE_KEY, storeId)
    } else {
      window.localStorage.removeItem(ACTIVE_STORE_STORAGE_KEY)
    }
  } catch {
    // storage unavailable (private mode / disabled) - selection stays in memory
  }
}

const StoresContext = React.createContext<StoresContextType>({
  stores: [],
  activeStoreId: "",
  activeStore: null,
  setActiveStoreId: () => {},
  addStore: async () => null,
  updateStore: async () => null,
  loading: true,
})

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = React.useState<Store[]>([])
  // Identifies which (account, role) the current `stores` snapshot belongs to.
  // `null` means "no trustworthy list yet".
  const [loadedScopeKey, setLoadedScopeKey] = React.useState<string | null>(null)
  const [preferredStoreId, setPreferredStoreId] = React.useState("")
  const { user, profile, loading: authLoading } = useAuth()

  // Admins manage every store in the project; everyone else only ever sees
  // the store they own. Access is decided server-side too (see
  // lib/supabase/store-access.ts), so this list is only what the UI offers.
  const isAdmin = profile?.is_admin === true

  // The scope key the store list *should* be at right now. It changes as soon
  // as the signed-in account or its resolved role changes, which means a list
  // fetched under the previous scope is stale and must not be trusted.
  const scopeKey = user?.id ? `${user.id}:${isAdmin ? "admin" : "owner"}` : null

  React.useEffect(() => {
    let cancelled = false

    async function load() {
      if (!user?.id) {
        setStores([])
        setLoadedScopeKey(null)
        return
      }

      const data = await getStoresFromSupabase(isAdmin ? undefined : user.id)

      if (cancelled) return
      setStores(data)
      setLoadedScopeKey(`${user.id}:${isAdmin ? "admin" : "owner"}`)
    }

    load()

    return () => {
      cancelled = true
    }
  }, [user?.id, isAdmin])

  // The snapshot on hand is only trustworthy once it was fetched for the
  // account that is active *now* (an account switch leaves the old list stale)
  // and once the role behind it is known. For an admin the list is fetched
  // twice: first as the single store they own while `profile` is still in
  // flight, and only afterwards as every store. `profile === null` after the
  // auth load finished means the role is *unknown*, and an unknown role must
  // never be read as "not an admin", because the owner-scoped list is then only
  // a subset of what the account may actually manage.
  const listMatchesScope = loadedScopeKey !== null && loadedScopeKey === scopeKey
  const roleResolved = !authLoading && profile !== null
  // With no stored selection there is nothing to protect, so the account may
  // default from its own store even while the role is still unresolved.
  const storesReady = scopeKey === null
    ? loadedScopeKey === null
    : listMatchesScope && (roleResolved || preferredStoreId === "")

  // The selected store is deliberately NOT derived from the auth session, so
  // switching stores never requires re-authenticating.
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setPreferredStoreId(readPersistedActiveStoreId())
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const activeStoreId = React.useMemo(() => {
    // While the store list is still resolving, the persisted selection is
    // honoured as-is. Falling back to `stores[0]` here is what used to make a
    // reload silently jump to the first store (and fetch that store's data)
    // before the real list arrived. A persisted id the account cannot access
    // is still safe: every read is authorized server-side by
    // resolveAccessibleStore, which answers 404 rather than another store's
    // rows, and the id is re-validated below as soon as the list is complete.
    if (!storesReady) return preferredStoreId

    // Re-validated against the now-complete accessible list, so a store from a
    // previous account (or one the user may no longer access) can never stay
    // active.
    if (preferredStoreId && stores.some((store) => store.id === preferredStoreId)) {
      return preferredStoreId
    }
    return stores[0]?.id ?? ""
  }, [preferredStoreId, stores, storesReady])

  const activeStore = React.useMemo(
    () => stores.find((store) => store.id === activeStoreId) ?? null,
    [stores, activeStoreId]
  )

  const setActiveStoreId = React.useCallback((storeId: string) => {
    setPreferredStoreId(storeId)
    persistActiveStoreId(storeId)
  }, [])

  const addStore = React.useCallback(async (store: Omit<Store, "id"> & { userId?: string }) => {
    const supabase = createClient()
    const slug = store.slug || generateStoreId()
    const userId = store.userId || user?.id || ""

    if (!userId) {
      throw new Error("You must be logged in to create a store")
    }

    // One-store-per-user enforcement (database also enforces via UNIQUE).
    // We pre-check here so we can return a friendly error instead of a
    // generic 23505 constraint violation message.
    const { data: existing } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle()

    if (existing) {
      throw new Error("You already have a store. Each admin can only create one store.")
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
      // Belt-and-suspenders: catch the DB constraint error too.
      if (error?.code === "23505" || /stores_user_id_unique/i.test(error?.message || "")) {
        throw new Error("You already have a store. Each admin can only create one store.")
      }
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
    <StoresContext.Provider value={{ stores, activeStoreId, activeStore, setActiveStoreId, addStore, updateStore, loading: !storesReady }}>
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
