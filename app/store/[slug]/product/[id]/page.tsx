"use client"

import * as React from "react"

import { useParams, useRouter, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card } from "@/components/ui/card"
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
  const slug = params.slug as string
  const productId = params.id as string
  const { addToCart, items } = useCart()

  const [data, setData] = React.useState<ProductData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [quantity, setQuantity] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/store/products/${productId}?storeSlug=${encodeURIComponent(slug)}`, { cache: "no-store" })
        if (!res.ok) {
          if (res.status === 404) {
            notFound()
            return
          }
          throw new Error("Failed to load product")
        }
        const json = await res.json()
        
        if (json.store.slug !== slug) {
          notFound()
          return
        }
        
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [productId, slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-error">{error || "Product not found"}</p>
      </div>
    )
  }

  const store = data.store
  const product = data.product

  const stock = parseStock(product?.stock)
  const isOutOfStock = stock === 0
  const isInactive = product ? !product.active : false
  const canAddToCart = !isOutOfStock && !isInactive

  const cartItem = items.find((item) => item.productId === product?.id)
  const currentCartQuantity = cartItem?.quantity || 0

  function increment() {
    setQuantity((prev) => Math.min(prev + 1, stock || 1))
  }

  function decrement() {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  function handleAddToCart() {
    if (!canAddToCart || !product) return
    const remainingStock = (stock || 0) - currentCartQuantity
    const addQuantity = Math.min(quantity, Math.max(remainingStock, 0))
    if (addQuantity <= 0) return

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, addQuantity)

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  function handleOrderNow() {
    if (!canAddToCart || !product) return
    const remainingStock = (stock || 0) - currentCartQuantity
    const addQuantity = Math.min(quantity, Math.max(remainingStock, 0))
    if (addQuantity <= 0) return

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    }, addQuantity)

    router.push(`/store/${slug}/checkout`)
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[]
  const mainImage = selectedImage || product.image || allImages[0] || ""

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href={`/store/${slug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex flex-col gap-4 p-4">
              <div className={cn("overflow-hidden bg-border-light rounded-xl", isSuitProduct(product) ? "flex aspect-[3/4] w-full items-center justify-center" : "aspect-square w-full")}>
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className={cn("transition-transform duration-300", isSuitProduct(product) ? "max-h-full max-w-full object-contain" : "h-full w-full object-cover")}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`h-16 w-16 shrink-0 rounded-lg border overflow-hidden bg-border-light transition-all duration-200 ${mainImage === img ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-muted-foreground"}`}
                    >
                      <img src={img} alt={`${product.name} ${idx + 1}`} className={cn("h-full w-full", isSuitProduct(product) ? "object-contain" : "object-cover")} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{product.name}</h1>
                    <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                  </div>
                  <Badge variant={product.active ? "success" : "outline"}>
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
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

                <div className="mt-8">
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="mt-auto pt-8 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch justify-center gap-3 w-full">
                    <div className="flex items-center justify-center rounded-md border border-input bg-background overflow-hidden shrink-0 self-center sm:self-stretch">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none border-0 h-10 w-10"
                        onClick={decrement}
                        disabled={quantity <= 1 || isOutOfStock || isInactive}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-10 text-center text-base font-medium select-none border-x border-input h-10 flex items-center justify-center">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none border-0 h-10 w-10"
                        onClick={increment}
                        disabled={quantity >= stock || isOutOfStock || isInactive}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      className="h-10 px-5 whitespace-nowrap sm:flex-1 sm:min-w-[8rem] basis-full sm:basis-auto"
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                    >
                      <span className="whitespace-nowrap">{added ? "Added to Cart" : isOutOfStock ? "Out of Stock" : isInactive ? "Unavailable" : "Add to Cart"}</span>
                    </Button>
                    <Button className="h-10 px-5 whitespace-nowrap sm:flex-1 sm:min-w-[8rem] basis-full sm:basis-auto" onClick={handleOrderNow} disabled={!canAddToCart}>
                      <span className="whitespace-nowrap">Order Now</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}
