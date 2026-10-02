import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { toProduct, toSlug } from "@/lib/data/products"
import type { DatabaseProduct } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: productSlug } = await params
  const url = new URL(request.url)
  const storeSlug = url.searchParams.get("storeSlug")

  if (!storeSlug) {
    return NextResponse.json({ error: "Store slug required" }, { status: 404 })
  }

  const supabase = createServiceClient()

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 })
  }

  let product: DatabaseProduct | null = null
  let productError: { code?: string; message?: string } | null = null

  const { data: productBySlug, error: slugError } = await supabase
    .from("products")
    .select("id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, created_at, updated_at")
    .eq("slug", productSlug)
    .eq("store_id", store.id)
    .eq("status", "Active")
    .single()

  if (!slugError && productBySlug) {
    product = productBySlug as DatabaseProduct
  } else if (slugError && slugError.code === "42703") {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, user_id, store_id, name, description, price, stock, image_url, status, sku, category, created_at, updated_at")
      .eq("store_id", store.id)
      .eq("status", "Active")

    if (!productsError && products) {
      product = (products.find((p) => toSlug(p.name) === productSlug) as DatabaseProduct) || null
    }
    productError = productsError
  } else {
    productError = slugError
  }

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  return NextResponse.json({
    product: toProduct(product),
    store: {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      heroTitle: store.hero_title,
      heroDescription: store.hero_description,
      updatedAt: store.updated_at,
    },
  }, { headers: { "Cache-Control": "no-store" } })
}
