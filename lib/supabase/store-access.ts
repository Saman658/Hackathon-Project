import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { createClient } from "@/lib/supabase/server"

type AccessibleStore = {
  id: string
  user_id: string
  slug: string
  name: string
}

export type StoreAccessResult =
  | { ok: true; store: AccessibleStore; isAdmin: boolean }
  | { ok: false; response: NextResponse }

/**
 * Resolves the store addressed by `?storeId=` / `?slug=` and authorizes the
 * signed-in session against it.
 *
 * Access rule:
 *  - an admin (profiles.is_admin) may read any store
 *  - everyone else may only read the store they own (stores.user_id)
 *
 * Anything else resolves to 404 so store existence is not disclosed.
 */
export async function resolveAccessibleStore(request: Request): Promise<StoreAccessResult> {
  const { searchParams } = new URL(request.url)
  const storeId = searchParams.get("storeId")
  const slug = searchParams.get("slug")

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id || null
  } catch {
    // treat unreadable sessions as unauthenticated
  }

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (!storeId && !slug) {
    return {
      ok: false,
      response: NextResponse.json({ error: "storeId is required" }, { status: 400 }),
    }
  }

  const serviceSupabase = createServiceClient()

  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userId)
    .maybeSingle()

  const isAdmin = profile?.is_admin === true

  let store: AccessibleStore | null = null

  if (slug) {
    const { data } = await serviceSupabase
      .from("stores")
      .select("id, user_id, slug, name")
      .eq("slug", slug)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    store = data
  } else {
    const { data } = await serviceSupabase
      .from("stores")
      .select("id, user_id, slug, name")
      .eq("id", storeId!)
      .maybeSingle()
    store = data
  }

  if (!store || (!isAdmin && store.user_id !== userId)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Store not found or access denied" }, { status: 404 }),
    }
  }

  return { ok: true, store, isAdmin }
}