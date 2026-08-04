"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const orders = [
  { id: "#1247", customer: "Sarah Chen", items: 3, total: "$249.99", status: "Completed", date: "Aug 3, 2025" },
  { id: "#1246", customer: "Marcus Johnson", items: 1, total: "$49.00", status: "Processing", date: "Aug 3, 2025" },
  { id: "#1245", customer: "Elena Rodriguez", items: 1, total: "$149.00", status: "Completed", date: "Aug 2, 2025" },
  { id: "#1244", customer: "David Kim", items: 2, total: "$199.98", status: "Pending", date: "Aug 2, 2025" },
  { id: "#1243", customer: "Lisa Wang", items: 1, total: "$49.00", status: "Completed", date: "Aug 1, 2025" },
  { id: "#1242", customer: "James Wilson", items: 4, total: "$349.96", status: "Shipped", date: "Aug 1, 2025" },
  { id: "#1241", customer: "Anna Lee", items: 2, total: "$129.98", status: "Completed", date: "Jul 31, 2025" },
]

const statusStyles: Record<string, "success" | "warning" | "outline" | "default"> = {
  Completed: "success",
  Processing: "warning",
  Pending: "outline",
  Shipped: "default",
}

export default function OrdersPage() {
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
                  <p className="text-2xl font-bold">1,245</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl font-bold text-success">892</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Processing</p>
                  <p className="text-2xl font-bold text-warning">187</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold text-muted-foreground">166</p>
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
                  {orders.map((order) => (
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
