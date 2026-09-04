import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/components/ui/button"
import type { Product } from "@/lib/data/products"
import { parseStock, isSuitProduct } from "@/lib/data/products"

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  className?: string
  storeSlug?: string
}

function ProductCardInner({ product, onAddToCart, className, storeSlug }: ProductCardProps) {
  const stock = parseStock(product.stock)
  const isOutOfStock = stock === 0
  const displayStock = isOutOfStock ? "Out of Stock" : "In Stock"
  const productHref = storeSlug ? `/store/${storeSlug}/product/${product.id}` : `/store/product/${product.id}`

  return (
    <Card className={cn("flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg", className)}>
      <Link href={productHref} className="block">
        <div
          className={cn(
            "w-full overflow-hidden bg-border-light",
            isSuitProduct(product)
              ? "flex h-[340px] w-full items-center justify-center"
              : "h-[320px] w-full"
          )}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={cn(
                "transition-transform duration-300",
                isSuitProduct(product)
                  ? "max-h-full max-w-full object-contain"
                  : "h-full w-full object-cover hover:scale-105"
              )}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Link href={productHref} className="group">
            <CardTitle className="text-base group-hover:text-accent transition-colors">{product.name}</CardTitle>
          </Link>
          <Badge variant={product.active ? "success" : "outline"}>
            {product.active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>SKU: {product.sku}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">{product.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Stock</p>
              <p className={`text-sm font-medium ${isOutOfStock ? "text-error" : ""}`}>{displayStock}</p>
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-3">
              {product.description}
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Link href={productHref} className="block flex-1">
              <Button className="w-full" disabled={isOutOfStock}>
                {isOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </Link>
            {onAddToCart && !isOutOfStock && (
              <Button variant="outline" onClick={() => onAddToCart(product)} className="px-3" aria-label="Add to cart">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { ProductCardInner as ProductCard }
