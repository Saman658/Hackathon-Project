import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { resolveAccessibleStore } from "@/lib/supabase/store-access"
import { mapSupabaseOrderRow } from "@/lib/data/orders"

export const dynamic = "force-dynamic"

/**
 * Store-scoped order feed for the dashboard.
 *
 * `public.orders` RLS is `auth.uid() = user_id`, so the browser client cannot
 * read another store's orders even when an admin is allowed to. This route
 * reuses the shared store-access check and reads through the service client so
 * revenue/order stats always follow the selected store ID.
 */
export async function GET(request: Request) {
  const access = await resolveAccessibleStore(request)

  if (!access.ok) {
    return access.response
  }

  const { store } = access
  const serviceSupabase = createServiceClient()

  const { data, error } = await serviceSupabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const orders = (data || []).map(mapSupabaseOrderRow)

  return NextResponse.json({ storeId: store.id, orders }, { headers: { "Cache-Control": "no-store" } })
}