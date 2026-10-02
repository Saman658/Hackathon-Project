import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/service"
import { StoreInitial } from "@/components/store/store-initial"

export const dynamic = "force-dynamic"

type StoreRow = {
  id: string
  name: string
  slug: string
  description: string | null
}

export default async function StoreIndexPage() {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from("stores")
    .select("id, name, slug, description")
    .order("created_at", { ascending: true })

  const stores: StoreRow[] = (data as StoreRow[] | null) ?? []

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
        <p className="text-muted-foreground mt-2">Choose a store to visit its storefront.</p>

        {stores.length === 0 ? (
          <p className="text-muted-foreground mt-10">No stores available.</p>
        ) : (
          <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <li key={store.id}>
                <Link
                  href={`/store/${store.slug}`}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
                >
                  <StoreInitial name={store.name} className="h-10 w-10 text-base" />
                  <span>
                    <span className="block font-semibold">{store.name}</span>
                    <span className="block text-sm text-muted-foreground mt-0.5">
                      {store.description || `/store/${store.slug}`}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
