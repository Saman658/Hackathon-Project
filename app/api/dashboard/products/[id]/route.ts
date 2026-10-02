import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { resolveAccessibleStore } from "@/lib/supabase/store-access"
import { toProduct } from "@/lib/data/products"

export const dynamic = "force-dynamic"

const PRODUCT_COLUMNS =
  "id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, slug, created_at, updated_at"

/**
 * Store-scoped product edit / delete.
 *
 * Both handlers require the *selected* store in `?storeId=` and authorize it
 * through `resolveAccessibleStore`, so a session can only touch a store it
 * manages (an admin any store, everyone else only their own).
 *
 * Every write is additionally constrained by `.eq("store_id", store.id)`. That
 * second gate is what makes a product from another store unreachable: the id in
 * the path alone is never enough, so selecting Mahrukh can never modify or
 * delete a Sehrish product and vice versa.
 *
 * Writes go through the service client because `products` RLS is keyed on
 * `user_id` (the store owner), which a managing admin does not match. The RLS
 * policies themselves are untouched.
 */
async function resolveProduct(request: Request, id: string) {
  const access = await resolveAccessibleStore(request)

  if (!access.ok) {
    return { ok: false as const, response: access.response }
  }

  const { store } = access
  const serviceSupabase = createServiceClient()

  const { data: product, error } = await serviceSupabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("id", id)
    .eq("store_id", store.id)
    .maybeSingle()

  if (error) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: error.message }, { status: 500 }),
    }
  }

  // A product that exists but belongs to another store is reported as "not
  // found" rather than "forbidden", so store ownership is never disclosed.
  if (!product) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Product not found in the selected store" },
        { status: 404 }
      ),
    }
  }

  return { ok: true as const, store, product, serviceSupabase }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resolved = await resolveProduct(request, id)

  if (!resolved.ok) {
    return resolved.response
  }

  const { store, product, serviceSupabase } = resolved

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const patch: Record<string, unknown> = {}

  if (typeof body.name === "string") {
    const name = body.name.trim()
    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 })
    }
    patch.name = name
  }

  if (typeof body.description === "string") {
    patch.description = body.description.trim() || null
  }

  if (typeof body.price === "string" || typeof body.price === "number") {
    const price = parseFloat(String(body.price).replace(/[^0-9.]/g, ""))
    if (!Number.isFinite(price)) {
      return NextResponse.json({ error: "Price must be a number" }, { status: 400 })
    }
    patch.price = price
  }

  if (typeof body.stock === "string" || typeof body.stock === "number") {
    const stock = parseInt(String(body.stock), 10)
    if (!Number.isFinite(stock)) {
      return NextResponse.json({ error: "Stock must be a number" }, { status: 400 })
    }
    patch.stock = stock
  }

  if (typeof body.image === "string") {
    const image = body.image.trim()
    if (!image) {
      patch.image_url = null
    } else if (/^https?:\/\//i.test(image) || image.startsWith("/")) {
      patch.image_url = image
    } else {
      patch.image_url = `/${image}`
    }
  }

  if (typeof body.status === "string" && body.status.trim()) {
    patch.status = body.status.trim()
  }

  if (typeof body.sku === "string") {
    patch.sku = body.sku.trim() || null
  }

  if (typeof body.category === "string") {
    patch.category = body.category.trim() || null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  const { data: updated, error } = await serviceSupabase
    .from("products")
    .update(patch)
    .eq("id", product.id)
    .eq("store_id", store.id)
    .select(PRODUCT_COLUMNS)
    .maybeSingle()

  if (error || !updated) {
    return NextResponse.json(
      { error: error?.message || "Failed to update product" },
      { status: 500 }
    )
  }

  if (updated.store_id !== store.id) {
    return NextResponse.json({ error: "Product was not updated in the selected store" }, { status: 500 })
  }

  return NextResponse.json(
    { storeId: store.id, product: toProduct(updated as Parameters<typeof toProduct>[0]) },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resolved = await resolveProduct(request, id)

  if (!resolved.ok) {
    return resolved.response
  }

  const { store, product, serviceSupabase } = resolved

  const { error } = await serviceSupabase
    .from("products")
    .delete()
    .eq("id", product.id)
    .eq("store_id", store.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { storeId: store.id, deletedId: product.id },
    { headers: { "Cache-Control": "no-store" } }
  )
}
