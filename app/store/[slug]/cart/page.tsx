"use client"

import * as React from "react"

import { useParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/data/products"
import { parseStock } from "@/lib/data/products"
import { useCart } from "@/components/store/cart-context"
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import Link from "next/link"

interface StoreData {
  store: {
    id: string
    name: string
    slug: string
    description: string
    logo: string
    heroTitle: string
    heroDescription: string
  }
  products: Product[]
}

export default function CartPage() {
  const params = useParams()
  const slug = params.slug as string
  const { items, cartCount, updateQuantity, removeItem } = useCart()

  const [data, setData] = React.useState<StoreData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

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
        <p className="text-muted-foreground">Loading...</p>
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
  const products = data.products

  const validatedItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product || !product.active) return null
      const stock = parseStock(product.stock)
      const safeQuantity = Math.min(item.quantity, Math.max(stock, 0))
      if (safeQuantity <= 0) return null
      return {
        ...item,
        quantity: safeQuantity,
        stock,
        image: product.image,
        price: product.price,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const subtotal = validatedItems.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
    return sum + numericPrice * item.quantity
  }, 0)

  const shipping = 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href={`/store/${slug}`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold tracking-tight">Shopping Cart</h1>
            {validatedItems.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Looks like you haven&apos;t added any products to your cart yet.
                  </p>
                  <Link href={`/store/${slug}`}>
                    <Button>Continue Shopping</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              validatedItems.map((item) => (
                <Card key={item.productId}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="h-24 w-24 shrink-0 rounded-lg border border-border overflow-hidden bg-border-light">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-base">{item.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{item.price}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-error"
                            onClick={() => removeItem(item.productId)}
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            {item.quantity >= item.stock && (
                              <span className="text-xs text-error">Max stock reached</span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Item total</p>
                            <p className="text-base font-semibold">
                              {(() => {
                                const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
                                return `$${(numericPrice * item.quantity).toFixed(2)}`
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `$${Number(shipping).toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <Link href={`/store/${slug}/checkout`} className="block">
                    <Button className="w-full" disabled={validatedItems.length === 0}>
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href={`/store/${slug}`} className="block">
                    <Button variant="secondary" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {cartCount} {cartCount === 1 ? "item" : "items"} in cart
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}
