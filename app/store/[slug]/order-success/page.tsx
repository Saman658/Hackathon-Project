"use client"

import * as React from "react"
import { useParams, useSearchParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchOrderFromSupabase, safeParsePrice } from "@/lib/data/orders"
import type { Order } from "@/lib/data/orders"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatDate(value: string): string {
  try {
    const date = new Date(value)
    return date.toLocaleString()
  } catch {
    return value
  }
}

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
}

export default function OrderSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const orderId = searchParams.get("orderId")
  const token = searchParams.get("token") ?? undefined

  const [data, setData] = React.useState<StoreData | null>(null)
  const [loadingStore, setLoadingStore] = React.useState(true)
  const [order, setOrder] = React.useState<Order | null>(null)
  const [loadingOrder, setLoadingOrder] = React.useState(true)

  React.useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch(`/api/store/${slug}`)
        if (!res.ok) {
          if (res.status === 404) {
            notFound()
            return
          }
        }
        const json = await res.json()
        setData(json)
      } catch {
        // ignore
      } finally {
        setLoadingStore(false)
      }
    }
    loadStore()
  }, [slug])

  React.useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setLoadingOrder(false)
        return
      }
      const data = await fetchOrderFromSupabase(orderId, token)
      setOrder(data)
      setLoadingOrder(false)
    }
    loadOrder()
  }, [orderId, token])

  if (loadingStore || loadingOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-error">Order not found</p>
      </div>
    )
  }

  const store = data.store

  return (
    <div className="min-h-screen bg-background">
      <StoreNavbar store={store} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-success-bg text-success flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">Order Successful</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Thank you for your purchase! Your order has been placed successfully.
              </p>

              <div className="rounded-xl border border-border bg-surface p-4 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Order ID</span>
                  <span className="text-sm font-medium">{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Customer</span>
                  <span className="text-sm font-medium">{order.customer.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-medium">{order.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface overflow-hidden mb-6 text-left">
                <div className="px-4 py-3 border-b border-border">
                  <h2 className="text-sm font-semibold">Order Items</h2>
                </div>
                <div className="divide-y divide-border">
                  {order.items.map((item: { productId: string; name: string; price: string | number; quantity: number }) => (
                    <div key={item.productId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(safeParsePrice(item.price))} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(safeParsePrice(item.price) * item.quantity)}
                        </p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-4 text-left space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shipping</span>
                  <span className="text-sm font-medium">{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span>
                </div>
                <div className="border-t border-border pt-2 flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">{formatCurrency(order.total)}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={`/store/${slug}`}>
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <StoreFooter store={store} />
    </div>
  )
}
