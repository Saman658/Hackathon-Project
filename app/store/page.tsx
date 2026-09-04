"use client"

import * as React from "react"

import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreHero } from "@/components/store/store-hero"
import { ProductGrid } from "@/components/store/product-grid"
import { StoreFooter } from "@/components/store/store-footer"
import type { Product } from "@/lib/data/products"
import { useCart } from "@/components/store/cart-context"

interface StoreData {
  store: {
    id: string
    name: string
    slug: string
    description: string
    logo: string
    heroTitle: string
    heroDescription: string
    updatedAt: string
  }
  products: Product[]
}

function StorePageClient({ data }: { data: StoreData }) {
  const { addToCart } = useCart()

  const store = data.store
  const filteredProducts = data.products ?? []

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main>
        <section className="pt-8 pb-2">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {store.name}
            </p>
          </div>
        </section>
        <StoreHero store={store} ctaLabel="Store Assistant" ctaHref="/store/chat" />
        <section id="products" className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} storeSlug={store.slug} />
          </div>
        </section>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}

export default function StorePage() {
  const [data, setData] = React.useState<StoreData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/store", { cache: "no-store" })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || "Failed to load store")
        }
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load store")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    )
  }

  if (error || !data) {
    const needsStore = error === "No store found"
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <h1 className="text-2xl font-bold tracking-tight mb-4">
            {needsStore ? "Welcome to Your Store" : "Store Error"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {needsStore
              ? "You don't have a store yet. Create your first store from the dashboard to get started."
              : error || "No store found"}
          </p>
          {needsStore && (
            <a href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary-light shadow-sm h-11 px-6 text-base">
              Go to Dashboard
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading store...</p></div>}>
      <StorePageClient data={data} />
    </React.Suspense>
  )
}
