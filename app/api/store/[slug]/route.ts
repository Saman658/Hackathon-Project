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

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single()

  if (storeError || !store) {
    return NextResponse.json({ error: "Store not found", needsStore: true }, { status: 404 })
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
    products: (products || []).map((row) => toProduct(row as Parameters<typeof toProduct>[0])),
  }, { headers: { "Cache-Control": "no-store" } })
}
