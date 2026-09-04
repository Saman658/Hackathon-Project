import { createClient } from "@/lib/supabase/client"

export type Store = {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  heroTitle: string
  heroDescription: string
  userId?: string
  updatedAt?: string
}

export interface DatabaseStore {
  id: string
  user_id: string
  name: string
  slug: string
  description: string | null
  logo: string | null
  hero_title: string
  hero_description: string
  created_at: string
  updated_at: string
}

export async function getStoresFromSupabase(userId?: string): Promise<Store[]> {
  const supabase = createClient()
  let query = supabase.from("stores").select("*").order("created_at", { ascending: true })

  if (userId) {
    query = query.eq("user_id", userId)
  }

  const { data, error } = await query

  if (error || !data) return []

  return data.map((row: DatabaseStore) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    logo: row.logo || "",
    heroTitle: row.hero_title || "",
    heroDescription: row.hero_description || "",
    userId: row.user_id,
  }))
}

export async function getStoreBySlug(slug: string): Promise<Store | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error || !data) return undefined

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    logo: data.logo || "",
    heroTitle: data.hero_title || "",
    heroDescription: data.hero_description || "",
    userId: data.user_id,
  }
}

export async function getStoreById(id: string): Promise<Store | undefined> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return undefined

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    logo: data.logo || "",
    heroTitle: data.hero_title || "",
    heroDescription: data.hero_description || "",
    userId: data.user_id,
  }
}

export function generateStoreId(): string {
  return `store_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export async function verifyStoreOwnership(storeId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", userId)
    .single()

  return !error && !!data
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
