import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"
import { toProduct } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export async function GET() {
  const serviceSupabase = createServiceClient()

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id || null
  } catch {
    // ignore cookie/session errors
  }

  if (!userId) {
    return NextResponse.json({ error: "No store found", needsStore: true }, { status: 404 })
  }

  const { data: stores, error: storesError } = await serviceSupabase
    .from("stores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)

  if (storesError || !stores || stores.length === 0) {
    return NextResponse.json({ error: "No store found", needsStore: true }, { status: 404 })
  }

  const store = stores[0]

  const { data: products, error: productsError } = await serviceSupabase
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
