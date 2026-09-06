import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { toProduct } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: stores, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .order("created_at", { ascending: false })

  if (storeError || !stores || stores.length === 0) {
    return NextResponse.json({ error: "Store not found", needsStore: true }, { status: 404 })
  }

  const store = stores[0]

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[storefront] slug=${slug} store_id=${store.id.slice(0, 8)}`
    )
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("status", "Active")
    .order("created_at", { ascending: false })

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 })
  }

  const safeProducts = (products || []).filter((row) => row.store_id === store.id)
  const mapped = safeProducts.map((row) => toProduct(row as Parameters<typeof toProduct>[0]))

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[storefront] slug=${slug} store_id=${store.id} returned ${mapped.length} products`
    )
  }

  return NextResponse.json({
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
    products: mapped,
  }, { headers: { "Cache-Control": "no-store" } })
}
