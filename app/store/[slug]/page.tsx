"use client"

import * as React from "react"

import { useParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreHero } from "@/components/store/store-hero"
import { ProductGrid } from "@/components/store/product-grid"
import { StoreFooter } from "@/components/store/store-footer"
import type { Product } from "@/lib/data/products"
import { publicProducts, fetchProductsFromSupabase } from "@/lib/data/products"
import { getStoreBySlug } from "@/lib/data/stores"
import { useCart } from "@/components/store/cart-context"

export default function DynamicStorePage() {
  const params = useParams()
  const slug = params.slug as string
  const store = getStoreBySlug(slug)
  const { addToCart } = useCart()

  if (!store) {
    notFound()
  }

  const storeId = store.id
  const initialProducts = publicProducts.filter((p) => p.storeId === store.id && p.active)
  const [storeProducts, setStoreProducts] = React.useState<Product[]>(initialProducts)

  React.useEffect(() => {
    async function load() {
      const data = await fetchProductsFromSupabase()
      const filtered = data.filter((p) => p.storeId === storeId && p.active)
      if (filtered.length > 0) {
        setStoreProducts(filtered)
      }
    }
    load()
  }, [storeId])

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
        <StoreHero store={store} />
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <ProductGrid products={storeProducts} onAddToCart={handleAddToCart} storeSlug={store.slug} />
          </div>
        </section>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}
