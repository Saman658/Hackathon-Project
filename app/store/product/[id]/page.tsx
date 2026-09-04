"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/components/ui/button"
import type { Product } from "@/lib/data/products"
import { parseStock, isSuitProduct } from "@/lib/data/products"
import { useCart } from "@/components/store/cart-context"
import { ArrowLeft, Minus, Plus } from "lucide-react"
import Link from "next/link"

interface ProductData {
  product: Product
  store: {
    id: string
    name: string
    slug: string
    description: string
    logo: string
    heroTitle: string
    heroDescription: string
  }
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { addToCart } = useCart()

  const [data, setData] = React.useState<ProductData | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/store/products/${productId}`, { cache: "no-store" })
        if (!res.ok) {
          setLoading(false)
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-error">Product not found</p>
      </div>
    )
  }

  const store = data.store
  const product = data.product
  const stock = parseStock(product?.stock)
  const isOutOfStock = stock === 0

  function handleOrderNow() {
    if (isOutOfStock || !product) return
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    router.push(`/store/${store.slug}/checkout`)
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href={`/store/${store.slug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-4 p-4">
              <div className={cn("w-full overflow-hidden bg-border-light md:aspect-auto md:h-full", isSuitProduct(product) ? "flex aspect-[3/4] items-center justify-center" : "aspect-square")}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className={cn("transition-transform duration-300", isSuitProduct(product) ? "max-h-full max-w-full object-contain" : "h-full w-full object-cover")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/store/${store.slug}/product/${product.id}`} className="group">
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
                      {isOutOfStock ? "Out of Stock" : "In Stock"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch justify-center gap-3 w-full pt-4 border-t border-border mt-auto">
                  <div className="flex items-center justify-center rounded-md border border-input bg-background overflow-hidden shrink-0 self-center sm:self-stretch">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none border-0 h-10 w-10"
                      onClick={() => {}}
                      disabled
                      aria-label="Quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-10 text-center text-base font-medium select-none border-x border-input h-10 flex items-center justify-center">1</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none border-0 h-10 w-10"
                      onClick={() => {}}
                      disabled
                      aria-label="Quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" className="h-10 px-5 whitespace-nowrap sm:flex-1 sm:min-w-[8rem] basis-full sm:basis-auto" onClick={() => addToCart({
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                  })} disabled={isOutOfStock}>
                    <span className="whitespace-nowrap">{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                  </Button>
                  <Button className="h-10 px-5 whitespace-nowrap sm:flex-1 sm:min-w-[8rem] basis-full sm:basis-auto" onClick={handleOrderNow} disabled={isOutOfStock}>
                    <span className="whitespace-nowrap">Order Now</span>
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}
