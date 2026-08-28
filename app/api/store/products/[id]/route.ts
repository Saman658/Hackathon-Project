import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { toProduct } from "@/lib/data/products"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const storeSlug = url.searchParams.get("storeSlug")
  const supabase = createServiceClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("status", "Active")
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("id", product.store_id)
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 })
  }

  if (storeSlug && store.slug !== storeSlug) {
    return NextResponse.json({ error: "Product not found in store" }, { status: 404 })
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
  })
}
