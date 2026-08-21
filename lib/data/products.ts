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
}

export interface DatabaseProduct {
  id: string
  user_id: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  status: string
  sku: string | null
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

export function toProduct(db: DatabaseProduct): Product {
  const localProduct = products.find((p) => p.sku === db.sku)
  const image = db.image_url || localProduct?.image || null
  return {
    id: db.id,
    name: db.name,
    sku: db.sku || `PROD-${db.id.slice(-6)}`,
    price: `$${db.price.toFixed(2)}`,
    stock: String(db.stock),
    status: db.status,
    image,
    description: db.description || "",
    storeId: "nexus",
    active: db.status === "Active",
  }
}

export function toDatabaseProduct(product: Partial<Product> & { user_id: string }): Omit<DatabaseProduct, 'created_at' | 'updated_at' | 'id'> {
  const priceStr = product.price || "0"
  const priceNum = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0
  const stockNum = parseInt(product.stock || "0", 10) || 0

  let imageUrl = product.image || null
  if (imageUrl && !imageUrl.startsWith("/")) {
    imageUrl = `/${imageUrl}`
  }

  return {
    user_id: product.user_id,
    name: product.name || "",
    description: product.description || null,
    price: priceNum,
    stock: stockNum,
    image_url: imageUrl,
    status: product.status || "Draft",
    sku: product.sku || null,
  }
}

export const products: Product[] = [
  { id: "1", name: "Suit Piece", sku: "PLAN-PRE", price: "$49.00", stock: "Unlimited", status: "Active", image: "/products/premium-plan.jpg", images: ["/products/premium-plan.jpg", "/products/basic-plan.jpg"], description: "Elevate your wardrobe with the Suit Piece — a refined men's suit crafted for professionals who demand elegance and confidence.", storeId: "nexus", active: true },
  { id: "2", name: "Shoes", sku: "PLAN-BAS", price: "$19.00", stock: "Unlimited", status: "Active", image: "/products/basic-plan.jpg", images: ["/products/basic-plan.jpg", "/products/premium-plan.jpg"], description: "Step into style with our Shoes — premium footwear designed for everyday comfort and modern aesthetics.", storeId: "nexus", active: true },
  { id: "3", name: "Dress Shirt", sku: "PLAN-ENT", price: "$149.00", stock: "Unlimited", status: "Active", image: "/products/enterprise-plan.jpg", description: "Make a lasting impression with the Dress Shirt — a high-quality formal shirt tailored for the modern professional.", storeId: "nexus", active: true },
  { id: "4", name: "Add-on Pack", sku: "ADD-001", price: "$9.00", stock: "500", status: "Active", image: "/products/add-on-pack.jpg", description: "Unlock extra value with the Add-on Pack — a curated collection of accessories to enhance your experience.", storeId: "nexus", active: true },
  { id: "5", name: "Headphones", sku: "SUP-OLD", price: "$29.00", stock: "10", status: "Discontinued", image: "/products/legacy-support.jpg", images: ["/products/legacy-support.jpg", "/products/legacy-support-2.jpg"], description: "Stay connected with Headphones — a professional headset delivering crystal-clear audio for calls and collaboration.", storeId: "nexus", active: true },
  { id: "6", name: "Classic Ladies Watch", sku: "WATCH-001", price: "$45.00", stock: "10", status: "Active", image: "/products/classic-ladies-watch.jpg", images: [], description: "Elegant and stylish ladies watch for everyday and special occasions.", storeId: "nexus", active: true },
]

export const publicProducts: Product[] = [...products]

export function addPublicProduct(product: Product) {
  publicProducts.unshift(product)
}

export function updatePublicProduct(product: Product) {
  const index = publicProducts.findIndex((p) => p.id === product.id)
  if (index >= 0) {
    publicProducts[index] = product
  }
}

export function removePublicProduct(productId: string) {
  const index = publicProducts.findIndex((p) => p.id === productId)
  if (index >= 0) {
    publicProducts.splice(index, 1)
  }
}

export async function seedInitialProducts(_userId: string) {
  return
}

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")

  if (error || !data || data.length === 0) {
    if (publicProducts.length === 0) {
      publicProducts.push(...products)
    }
    return publicProducts
  }

  const mapped = data.map(toProduct)
  publicProducts.length = 0
  publicProducts.push(...mapped)
  return publicProducts
}

export async function fetchProductFromSupabase(productId: string): Promise<Product | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single()

  if (error || !data) return null

  return toProduct(data)
}
