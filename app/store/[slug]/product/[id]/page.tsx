"use client"

import * as React from "react"
import { useParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/data/products"
import { publicProducts, parseStock, fetchProductFromSupabase } from "@/lib/data/products"
import { getStoreBySlug } from "@/lib/data/stores"
import { useCart } from "@/components/store/cart-context"
import { ArrowLeft, Minus, Plus, ShoppingCart, Zap } from "lucide-react"
import Link from "next/link"

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const productId = params.id as string
  const { addToCart, items } = useCart()

  const store = getStoreBySlug(slug)
  const [product, setProduct] = React.useState<Product | undefined>(
    publicProducts.find((p) => p.id === productId)
  )
  const [productLoading, setProductLoading] = React.useState(false)
  const [quantity, setQuantity] = React.useState(1)
  const [added, setAdded] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null)

  const stock = parseStock(product?.stock)
  const isOutOfStock = stock === 0
  const isInactive = product ? !product.active : false
  const belongsToStore = product ? product.storeId === store?.id : false
  const canAddToCart = !isOutOfStock && !isInactive && belongsToStore

  const cartItem = items.find((item) => item.productId === product?.id)
  const currentCartQuantity = cartItem?.quantity || 0

  React.useEffect(() => {
    async function load() {
      if (!productId) return
      const found = publicProducts.find((p) => p.id === productId)
      if (found) {
        setProduct(found)
        return
      }
      setProductLoading(true)
      const supabaseProduct = await fetchProductFromSupabase(productId)
      setProduct(supabaseProduct || undefined)
      setProductLoading(false)
    }
    load()
  }, [productId])

  React.useEffect(() => {
    if (!store || !product || !belongsToStore) {
      notFound()
    }
  }, [store, product, belongsToStore])

  if (!store || !product || !belongsToStore) {
    return null
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[]
  const mainImage = selectedImage || product.image || allImages[0] || ""

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
              <div className="aspect-square w-full overflow-hidden bg-border-light rounded-xl">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
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
                      <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
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
                  <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={decrement}
                        disabled={quantity <= 1 || isOutOfStock || isInactive}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center text-base font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={increment}
                        disabled={quantity >= stock || isOutOfStock || isInactive}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        className="w-full sm:flex-1 min-w-0 whitespace-nowrap"
                        onClick={handleAddToCart}
                        disabled={!canAddToCart}
                      >
                        <span className="whitespace-nowrap">{added ? "Added to Cart" : isOutOfStock ? "Out of Stock" : isInactive ? "Unavailable" : "Add to Cart"}</span>
                      </Button>
                      <Button className="w-full sm:flex-1 min-w-0 whitespace-nowrap" disabled={isOutOfStock || isInactive}>
                        <span className="whitespace-nowrap">Order Now</span>
                      </Button>
                    </div>
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
