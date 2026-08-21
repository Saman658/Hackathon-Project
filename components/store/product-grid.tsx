import * as React from "react"
import { ProductCard } from "@/components/store/product-card"
import type { Product } from "@/lib/data/products"
import { cn } from "@/components/ui/button"

interface ProductGridProps {
  products: Product[]
  onAddToCart?: (product: Product) => void
  className?: string
  storeSlug?: string
}

function ProductGridInner({ products, onAddToCart, className, storeSlug }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No products available yet.
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} storeSlug={storeSlug} />
      ))}
    </div>
  )
}

export { ProductGridInner as ProductGrid }
