"use client"

import * as React from "react"
import { useParams, useSearchParams, notFound } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getStoreBySlug } from "@/lib/data/stores"
import { fetchOrderFromSupabase } from "@/lib/data/orders"
import type { Order } from "@/lib/data/orders"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function CheckoutSuccessPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const orderId = searchParams.get("orderId")

  const store = getStoreBySlug(slug)

  if (!store) {
    notFound()
  }

  const [order, setOrder] = React.useState<Order | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (!orderId) {
        setLoading(false)
        return
      }
      const data = await fetchOrderFromSupabase(orderId)
      setOrder(data)
      setLoading(false)
    }
    load()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar store={store} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Loading...</h1>
              </CardContent>
            </Card>
          </div>
        </main>
        <StoreFooter store={store} />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <StoreNavbar store={store} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight mb-2">Order not found</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  We couldn&apos;t find this order. It may have been removed or the link is invalid.
                </p>
                <Link href={`/store/${slug}`}>
                  <Button>Continue Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
        <StoreFooter store={store} />
      </div>
    )
  }

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
              <h1 className="text-2xl font-bold tracking-tight mb-2">Order Confirmed</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Thank you for your purchase. Your order has been placed successfully.
              </p>

              {order && (
                <div className="rounded-xl border border-border bg-surface p-4 text-left space-y-2 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Order ID</span>
                    <span className="text-sm font-medium">{order.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Items</span>
                    <span className="text-sm font-medium">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </div>
              )}

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
