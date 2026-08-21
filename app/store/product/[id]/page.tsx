"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/data/products"
import { publicProducts, parseStock, fetchProductFromSupabase } from "@/lib/data/products"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react"
import { useCart } from "@/components/store/cart-context"
import { mockStore } from "@/lib/data/stores"

export default function ProductDetailPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = React.useState<Product | null>(null)
  const [loading, setLoading] = React.useState(true)
  const stock = parseStock(product?.stock)
  const isOutOfStock = stock === 0

  React.useEffect(() => {
    async function load() {
      if (!params.id) {
        setLoading(false)
        return
      }
      const found = publicProducts.find((p) => p.id === params.id) || null
      if (found) {
        setProduct(found)
        setLoading(false)
        return
      }
      const supabaseProduct = await fetchProductFromSupabase(params.id as string)
      setProduct(supabaseProduct)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar store={mockStore} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Loading...</h1>
            </CardContent>
          </Card>
        </main>
        <StoreFooter store={mockStore} />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar store={mockStore} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Product not found</h1>
              <p className="text-muted-foreground mb-6">The product you are looking for does not exist.</p>
              <Link href="/store">
                <Button>Back to Store</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <StoreFooter store={mockStore} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={mockStore} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/store" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Link href={`/store/product/${product.id}`} className="block">
              <div className="aspect-square w-full overflow-hidden bg-border-light md:aspect-auto md:h-full">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </Link>
            <div className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/store/product/${product.id}`} className="group">
                      <CardTitle className="text-2xl group-hover:text-accent transition-colors">{product.name}</CardTitle>
                    </Link>
                    <CardDescription className="mt-1">SKU: {product.sku}</CardDescription>
                  </div>
                  <Badge variant={product.status === "Active" ? "success" : "outline"}>
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-3xl font-bold">{product.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Stock</p>
                    <p className={`text-2xl font-bold ${isOutOfStock ? "text-error" : ""}`}>
                      {isOutOfStock ? "Out of Stock" : product.stock}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-auto">
                  <Button variant="outline" className="w-full" onClick={() => addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })} disabled={isOutOfStock}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span className="whitespace-nowrap">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                  </Button>
                  <Button className="w-full" disabled={isOutOfStock}>
                    <Zap className="mr-2 h-4 w-4" />
                    <span className="whitespace-nowrap">Order Now</span>
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </main>
      <StoreFooter store={mockStore} />
    </div>
  )
}
