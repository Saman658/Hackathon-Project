import { createClient } from "@/lib/supabase/client"

export interface Product {
  id: string
  name: string
  sku: string
  price: string
  stock: string
  status: string
  image: string | null
  images?: string[]
  description: string
  storeId: string
  active: boolean
  category?: string
}

export interface DatabaseProduct {
  id: string
  user_id: string
  store_id?: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  status: string
  sku: string | null
  category?: string | null
  created_at: string
  updated_at: string
}

export function parseStock(value: string | number | undefined | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (value == null) return 0
  const trimmed = value.trim()
  if (trimmed === "" || trimmed === "null" || trimmed === "undefined") return 0
  const parsed = Number(trimmed)
  if (Number.isFinite(parsed)) return parsed
  return Infinity
}

export function getProductCategory(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes("frock") || n.includes("dress")) return "frocks"
  if (n.includes("ladies suit") || n.includes("suit")) return "ladies-suits"
  if (n.includes("ladies shirt") || n.includes("shirt")) return "ladies-shirts"
  return null
}

export function toProduct(db: DatabaseProduct): Product {
  return {
    id: db.id,
    name: db.name,
    sku: db.sku || `PROD-${db.id.slice(-6)}`,
    price: `$${db.price.toFixed(2)}`,
    stock: String(db.stock),
    status: db.status,
    image: db.image_url || null,
    description: db.description || "",
    storeId: db.store_id || "",
    active: db.status === "Active",
    category: (db.category || getProductCategory(db.name)) || undefined,
  }
}

export function toDatabaseProduct(product: Partial<Product> & { user_id: string; store_id?: string }): Omit<DatabaseProduct, 'created_at' | 'updated_at' | 'id'> {
  const priceStr = product.price || "0"
  const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0
  const stockNum = parseInt(product.stock || "0", 10) || 0

  let imageUrl = product.image || null
  if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/")) {
    imageUrl = `/${imageUrl}`
  }

  return {
    user_id: product.user_id,
    store_id: product.store_id || product.user_id,
    name: product.name || "",
    description: product.description || null,
    price: priceNum,
    stock: stockNum,
    image_url: imageUrl,
    status: product.status || "Draft",
    sku: product.sku || null,
    category: product.category || null,
  }
}

export async function fetchProductsFromSupabase(userId?: string, storeId?: string): Promise<Product[]> {
  const supabase = createClient()
  let query = supabase.from("products").select("id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, created_at, updated_at")

  if (userId) {
    query = query.eq("user_id", userId)
  }

  if (storeId) {
    query = query.eq("store_id", storeId)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    return []
  }

  return data.map(toProduct)
}

