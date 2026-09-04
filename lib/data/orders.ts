import { createClient } from "@/lib/supabase/client"

export function safeParsePrice(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return 0
    const parsed = parseFloat(trimmed.replace(/[^0-9.]/g, ""))
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export type OrderItem = {
  productId: string
  name: string
  price: string | number
  quantity: number
}

export type Order = {
  id: string
  storeId: string
  accessToken?: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  status: string
  createdAt: string
}

export type DatabaseOrderItem = {
  product_id: string
  product_name: string
  price: number
  quantity: number
}

export async function getStoreOwnerId(storeId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("stores")
    .select("user_id")
    .eq("id", storeId)
    .single()

  return data?.user_id || null
}

function generateOrderId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function createOrderInSupabase(orderData: {
  storeId: string
  customer: Order["customer"]
  items: Order["items"]
  subtotal: number
  shipping: number
  total: number
  status: string
}): Promise<Order> {
  const supabase = createClient()

  const ownerId = await getStoreOwnerId(orderData.storeId)

  const id = generateOrderId()
  const accessToken = generateOrderId()
  const createdAt = new Date().toISOString()

  const { error: orderError } = await supabase
    .from("orders")
    .insert({
      id,
      access_token: accessToken,
      user_id: ownerId,
      store_id: orderData.storeId,
      customer_name: orderData.customer.fullName,
      customer_email: orderData.customer.email,
      customer_phone: orderData.customer.phone,
      shipping_address: orderData.customer.address,
      city: orderData.customer.city,
      postal_code: orderData.customer.postalCode,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      status: orderData.status,
    })

  if (orderError) throw orderError

  const itemsPayload = orderData.items.map((item) => ({
    order_id: id,
    product_id: item.productId,
    product_name: item.name,
    price: parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload)

  if (itemsError) throw itemsError

  return {
    id,
    storeId: orderData.storeId,
    accessToken,
    customer: {
      fullName: orderData.customer.fullName,
      email: orderData.customer.email,
      phone: orderData.customer.phone,
      address: orderData.customer.address,
      city: orderData.customer.city,
      postalCode: orderData.customer.postalCode,
    },
    items: orderData.items,
    subtotal: orderData.subtotal,
    shipping: orderData.shipping,
    total: orderData.total,
    status: orderData.status,
    createdAt,
  }
}

type SupabaseOrderRow = {
  id: string
  store_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  shipping_address: string
  city: string
  postal_code: string
  subtotal: number
  shipping: number
  total: number
  status: string
  created_at: string
  order_items?: DatabaseOrderItem[]
}

function mapSupabaseOrderRow(order: SupabaseOrderRow): Order {
  return {
    id: order.id,
    storeId: order.store_id,
    customer: {
      fullName: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      city: order.city,
      postalCode: order.postal_code,
    },
    items: (order.order_items || []).map((item) => ({
      productId: item.product_id,
      name: item.product_name,
      price: typeof item.price === "number" ? item.price.toFixed(2) : String(item.price ?? 0),
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }
}

// Secure order lookup: resolves the order via the server-side /api/order route
// (service-role client + non-guessable access token). This keeps `orders`
// unreadable from the browser while still powering the order-success page.
export async function fetchOrderFromSupabase(
  orderId: string,
  token?: string
): Promise<Order | null> {
  const params = new URLSearchParams({ orderId })
  if (token) params.set("token", token)

  try {
    const res = await fetch(`/api/order?${params.toString()}`)
    if (!res.ok) return null
    const json = (await res.json()) as { order?: SupabaseOrderRow }
    if (!json.order) return null
    return mapSupabaseOrderRow(json.order)
  } catch {
    return null
  }
}

export async function fetchOrdersFromSupabase(userId: string): Promise<Order[]> {
  const supabase = createClient()

  const { data: ordersData, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !ordersData) return []

  return ordersData.map((order) => ({
    id: order.id,
    storeId: order.store_id,
    customer: {
      fullName: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      city: order.city,
      postalCode: order.postal_code,
    },
    items: (order.order_items || []).map((item: DatabaseOrderItem) => ({
      productId: item.product_id,
      name: item.product_name,
      price: typeof item.price === "number" ? item.price.toFixed(2) : String(item.price ?? 0),
      quantity: item.quantity,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }))
}
