"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { fetchOrdersFromSupabase } from "@/lib/data/orders"

const statusStyles: Record<string, "success" | "warning" | "outline" | "default"> = {
  Completed: "success",
  Processing: "warning",
  Pending: "outline",
  Shipped: "default",
}

function formatOrderDate(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function mapOrderToRow(order: {
  id: string
  customer: { fullName: string }
  items: { quantity: number }[]
  total: number
  status: string
  createdAt: string
}) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
  return {
    id: order.id,
    customer: order.customer.fullName,
    items: itemCount,
    total: `$${order.total.toFixed(2)}`,
    status: order.status,
    date: formatOrderDate(order.createdAt),
  }
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = React.useState<ReturnType<typeof mapOrderToRow>[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (!user) return
      const data = await fetchOrdersFromSupabase(user.id)
      setOrders(data.map(mapOrderToRow))
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
                <p className="text-sm text-muted-foreground mt-1">Track and manage customer orders.</p>
              </div>
              <Button>Export Orders</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-success">{orders.filter((o) => o.status === "Completed").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Processing</p>
                  <p className="text-2xl font-bold text-warning">{orders.filter((o) => o.status === "Processing").length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold text-muted-foreground">{orders.filter((o) => o.status === "Pending").length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading orders...
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.items}</TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>
                          <Badge variant={statusStyles[order.status]}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.date}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
