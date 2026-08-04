"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard, defaultCards } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { ActivityList, defaultActivities } from "@/components/dashboard/activity-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const recentOrders = [
  { id: "#1247", customer: "Sarah Chen", product: "Premium Plan", amount: "$249.99", status: "Completed", date: "2 min ago" },
  { id: "#1246", customer: "Marcus Johnson", product: "Basic Plan", amount: "$49.00", status: "Processing", date: "15 min ago" },
  { id: "#1245", customer: "Elena Rodriguez", product: "Enterprise Plan", amount: "$149.00", status: "Completed", date: "1 hour ago" },
  { id: "#1244", customer: "David Kim", product: "Premium Plan", amount: "$249.99", status: "Pending", date: "2 hours ago" },
  { id: "#1243", customer: "Lisa Wang", product: "Basic Plan", amount: "$49.00", status: "Completed", date: "3 hours ago" },
]

const statusStyles: Record<string, "success" | "warning" | "outline"> = {
  Completed: "success",
  Processing: "warning",
  Pending: "outline",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {defaultCards.map((card, i) => (
                <AnalyticsCard key={i} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Revenue Overview" description="Monthly revenue breakdown" />
              </div>
              <div>
                <ChartPlaceholder title="Traffic Sources" description="Where visitors come from" type="donut" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover">
                      View all
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>{order.amount}</TableCell>
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
              <div>
                <ActivityList activities={defaultActivities} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
