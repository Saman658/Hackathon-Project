"use client"

import * as React from "react"
import { useParams, notFound, useRouter } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/lib/data/products"
import { publicProducts, parseStock, fetchProductsFromSupabase } from "@/lib/data/products"
import type { Order } from "@/lib/data/orders"
import { createOrderInSupabase } from "@/lib/data/orders"
import { getStoreBySlug } from "@/lib/data/stores"
import { useCart } from "@/components/store/cart-context"
import { ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { items, cartCount, clearCart } = useCart()

  const store = getStoreBySlug(slug)

  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [city, setCity] = React.useState("")
  const [postalCode, setPostalCode] = React.useState("")

  const [errors, setErrors] = React.useState<{
    fullName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
    general?: string
  }>({})

  const [submitting, setSubmitting] = React.useState(false)

  if (!store) {
    notFound()
    return null
  }

  const storeId = store.id

  const [products, setProducts] = React.useState<Product[]>(publicProducts)

  React.useEffect(() => {
    async function load() {
      const data = await fetchProductsFromSupabase()
      const filtered = data.filter((p) => p.storeId === storeId && p.active)
      if (filtered.length > 0) {
        setProducts(filtered)
      }
    }
    load()
  }, [storeId])

  const validatedItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product || !product.active) return null
      const stock = parseStock(product.stock)
      const safeQuantity = Math.min(item.quantity, Math.max(stock, 0))
      if (safeQuantity <= 0) return null
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: safeQuantity,
        stock,
        image: item.image ?? product.image ?? null,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  const subtotal = validatedItems.reduce((sum, item) => {
    const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
    return sum + numericPrice * item.quantity
  }, 0)

  const shipping = 0
  const total = subtotal + shipping

  function validate() {
    const newErrors: typeof errors = {}
    if (!fullName.trim()) newErrors.fullName = "Full name is required"
    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Invalid email address"
    }
    if (!phone.trim()) newErrors.phone = "Phone is required"
    if (!address.trim()) newErrors.address = "Address is required"
    if (!city.trim()) newErrors.city = "City is required"
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required"

    if (validatedItems.length === 0) {
      newErrors.general = "Your cart is empty or contains unavailable products."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handlePlaceOrder() {
    if (!validate() || submitting) return
    setSubmitting(true)

    try {
      const order = await createOrderInSupabase({
        storeId,
        customer: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        },
        items: validatedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        total,
        status: "Pending",
      })

      clearCart()
      router.push(`/store/${slug}/order-success?orderId=${order.id}`)
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string; hint?: string; code?: string }
      console.error("Failed to place order:", {
        message: err.message,
        details: err.details,
        hint: err.hint,
        code: err.code,
        raw: error,
      })
      setErrors((prev) => ({
        ...prev,
        general: err.message || "Failed to place order. Please try again.",
      }))
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href={`/store/${slug}/cart`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-8">Checkout</h1>

        {errors.general && (
          <Card className="mb-6">
            <CardContent className="p-4 text-error text-sm">
              {errors.general}
              <Link href={`/store/${slug}`} className="block mt-2 font-medium underline">
                Continue Shopping
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">Customer Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name <span className="text-error">*</span></label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" error={errors.fullName} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Email <span className="text-error">*</span></label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" error={errors.email} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Phone <span className="text-error">*</span></label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" error={errors.phone} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Address <span className="text-error">*</span></label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" error={errors.address} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">City <span className="text-error">*</span></label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" error={errors.city} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Postal Code <span className="text-error">*</span></label>
                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="10001" error={errors.postalCode} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="divide-y divide-border">
                    {validatedItems.map((item) => (
                      <div key={item.productId} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-surface">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                              No img
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium flex-shrink-0">
                          ${(parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0) * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
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
                </div>
                <div className="mt-6 space-y-3">
                  <Button className="w-full" onClick={handlePlaceOrder} disabled={submitting || validatedItems.length === 0}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                  <Link href={`/store/${slug}/cart`} className="block">
                    <Button variant="secondary" className="w-full" disabled={submitting}>
                      Back to Cart
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
