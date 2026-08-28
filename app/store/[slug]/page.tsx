"use client"

import * as React from "react"

import { useParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreHero } from "@/components/store/store-hero"
import { CategoryGrid } from "@/components/store/category-grid"
import { ProductGrid } from "@/components/store/product-grid"
import { StoreFooter } from "@/components/store/store-footer"
import type { Product } from "@/lib/data/products"
import { useCart } from "@/components/store/cart-context"
import { useSearchParams } from "next/navigation"

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

export default function DynamicStorePage() {
  const params = useParams()
  const slug = params.slug as string
  const { addToCart } = useCart()
  const searchParams = useSearchParams()

  const [data, setData] = React.useState<StoreData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const selectedCategory = searchParams.get("category")

  const filteredProducts = React.useMemo(() => {
    let products = data?.products ?? []

    if (selectedCategory) {
      products = products.filter((p) => p.category === selectedCategory)
    }

    return products
  }, [data?.products, selectedCategory])

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/store/${slug}`, { cache: "no-store" })
        if (!res.ok) {
          if (res.status === 404) {
            notFound()
            return
          }
          throw new Error("Failed to load store")
        }
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load store")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading store...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-error">{error || "Store not found"}</p>
      </div>
    )
  }

  const store = data.store

  const handleAddToCart = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main>
        <StoreHero store={store} />
        <CategoryGrid
          storeSlug={store.slug}
          categories={[
            { name: "Ladies Shirts", image: "/categories/ladies-shirts.jpg", slug: "ladies-shirts" },
            { name: "Ladies Suits", image: "/categories/ladies-suits.jpg", slug: "ladies-suits" },
            { name: "Frocks", image: "/categories/frocks.jpg", slug: "frocks" },
          ]}
          activeCategory={selectedCategory}
        />
        {selectedCategory && (
          <section className="py-4">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize">
                {selectedCategory.replace(/-/g, " ")}
              </h2>
              <a
                href={`/store/${store.slug}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filter
              </a>
            </div>
          </section>
        )}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} storeSlug={store.slug} />
          </div>
        </section>
      </main>
      <StoreFooter store={store} className="mt-auto" />
    </div>
  )
}
