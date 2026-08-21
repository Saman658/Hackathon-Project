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

export type Order = {
  id: string
  storeId: string
  customer: {
    fullName: string
    email: string
    phone: string
    address: string
    city: string
    postalCode: string
  }
  items: {
    productId: string
    name: string
    price: string | number
    quantity: number
  }[]
  subtotal: number
  shipping: number
  total: number
  status: string
  createdAt: string
}

export const orders: Order[] = []

const ORDERS_STORAGE_KEY = "nexus-store-orders"

function loadOrdersFromStorage(): Order[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Order[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (order) =>
        order &&
        typeof order.id === "string" &&
        typeof order.storeId === "string" &&
        typeof order.customer === "object" &&
        Array.isArray(order.items)
    )
  } catch {
    return []
  }
}

function saveOrdersToStorage() {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch {
    // ignore storage errors
  }
}

export function generateOrderId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function addOrder(order: Order) {
  orders.unshift(order)
  saveOrdersToStorage()
}

export function getOrdersByStore(storeId: string): Order[] {
  return orders.filter((order) => order.storeId === storeId)
}

export function getCompletedOrdersByStore(storeId: string): Order[] {
  return orders.filter((order) => order.storeId === storeId && order.status === "Completed")
}

export function calculateRevenueByStore(storeId: string): number {
  return getCompletedOrdersByStore(storeId).reduce((sum, order) => sum + order.total, 0)
}

if (typeof window !== "undefined") {
  const loaded = loadOrdersFromStorage()
  if (loaded.length > 0) {
    orders.length = 0
    orders.push(...loaded)
  }
}

export async function getStoreOwnerId(storeId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("products")
    .select("user_id")
    .limit(1)

  return data?.[0]?.user_id || null
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
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
    .select()
    .single()

  if (orderError) throw orderError

  const itemsPayload = orderData.items.map((item) => ({
    order_id: order.id,
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
    items: orderData.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    status: order.status,
    createdAt: order.created_at,
  }
}

export async function fetchOrderFromSupabase(orderId: string): Promise<Order | null> {
  const supabase = createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single()

  if (error || !order) return null

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
    items: (order.order_items || []).map((item: any) => ({
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
    items: (order.order_items || []).map((item: any) => ({
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
