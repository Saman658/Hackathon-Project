import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { resolveAccessibleStore } from "@/lib/supabase/store-access"
import { toProduct, toDatabaseProduct } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const access = await resolveAccessibleStore(request)

  if (!access.ok) {
    return access.response
  }

  const { store } = access
  const serviceSupabase = createServiceClient()

  const { data: products, error: productsError } = await serviceSupabase
    .from("products")
    .select("id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, created_at, updated_at")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 })
  }

  const safeProducts = (products || []).filter((row) => row.store_id === store.id)
  const mapped = safeProducts.map((row) => toProduct(row as Parameters<typeof toProduct>[0]))

  return NextResponse.json({ storeId: store.id, products: mapped }, { headers: { "Cache-Control": "no-store" } })
}

/**
 * Store-scoped product creation.
 *
 * The product is written for the *selected* store (`?storeId=`), never for the
 * signed-in user. `resolveAccessibleStore` is the only authorization gate: it
 * answers 404 for a store the session may not manage, so an arbitrary store id
 * in the request body can never be trusted — the resolved `store.id` is what
 * ends up in the row.
 *
 * `products.user_id` is set to the store owner (`store.user_id`), which is what
 * the browser-client RLS policies on `products` key off. Writing the acting
 * admin's id there instead would hand the row to the admin and lock the store
 * owner out of their own catalog, so the owner is always used.
 */
export async function POST(request: Request) {
  const access = await resolveAccessibleStore(request)

  if (!access.ok) {
    return access.response
  }

  const { store } = access

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const name = typeof body.name === "string" ? body.name.trim() : ""
  const priceRaw = typeof body.price === "string" ? body.price : typeof body.price === "number" ? String(body.price) : ""
  const stockRaw = typeof body.stock === "string" ? body.stock : typeof body.stock === "number" ? String(body.stock) : ""

  if (!name) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 })
  }
  if (!priceRaw.trim()) {
    return NextResponse.json({ error: "Price is required" }, { status: 400 })
  }
  if (!stockRaw.trim()) {
    return NextResponse.json({ error: "Stock is required" }, { status: 400 })
  }

  let sessionUserId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    sessionUserId = user?.id || null
  } catch {
    // resolveAccessibleStore already rejected unauthenticated sessions
  }

  if (!sessionUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const dbProduct = toDatabaseProduct({
    name,
    description: typeof body.description === "string" ? body.description.trim() : "",
    price: priceRaw.trim(),
    stock: stockRaw.trim(),
    image: typeof body.image === "string" ? body.image.trim() : "",
    status: typeof body.status === "string" && body.status ? body.status : "Active",
    sku: typeof body.sku === "string" && body.sku.trim() ? body.sku.trim() : undefined,
    category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : undefined,
    // Never taken from the request: the store resolved above is the target.
    user_id: store.user_id,
    store_id: store.id,
  })

  const serviceSupabase = createServiceClient()

  // `products.slug` is globally unique and is what the storefront links use, so
  // a name-derived slug would collide with an identical product name in the
  // other store. The slug is left NULL here on purpose so the existing
  // `set_product_slug` database trigger generates a de-duplicated one.
  const { data: created, error } = await serviceSupabase
    .from("products")
    .insert({ ...dbProduct, slug: null })
    .select("id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, slug, created_at, updated_at")
    .single()

  if (error || !created) {
    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    )
  }

  // Defensive: a row that did not land in the selected store is never reported
  // back to the dashboard.
  if (created.store_id !== store.id) {
    return NextResponse.json({ error: "Product was not created in the selected store" }, { status: 500 })
  }

  return NextResponse.json(
    {
      storeId: store.id,
      product: toProduct(created as Parameters<typeof toProduct>[0]),
    },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  )
}