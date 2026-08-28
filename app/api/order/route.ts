import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"

export const dynamic = "force-dynamic"

// Secure, server-side order lookup for the order-success page.
// Uses the service-role client (bypasses RLS) and requires BOTH the order id
// and a non-guessable access_token, so customer order data is never exposed
// publicly and cannot be enumerated by guessing an id.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get("orderId")
  const token = searchParams.get("token")

  if (!orderId || !token) {
    return NextResponse.json({ error: "Missing orderId or token" }, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("access_token", token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  return NextResponse.json({ order: data })
}
