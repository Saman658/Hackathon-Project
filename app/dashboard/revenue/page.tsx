"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard, defaultCards } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { useAuth } from "@/components/providers/auth-provider"
import { fetchOrdersFromSupabase } from "@/lib/data/orders"

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function RevenuePage() {
  const { user } = useAuth()
  const [revenue, setRevenue] = React.useState(0)
  const [totalOrders, setTotalOrders] = React.useState(0)
  const [pendingOrders, setPendingOrders] = React.useState(0)

  React.useEffect(() => {
    async function load() {
      if (!user) return
      const data = await fetchOrdersFromSupabase(user.id)
      const completed = data.filter((o) => o.status === "Completed")
      setRevenue(completed.reduce((sum, order) => sum + order.total, 0))
      setTotalOrders(completed.length)
      setPendingOrders(data.filter((o) => o.status === "Pending").length)
    }
    load()
  }, [user])

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(revenue),
      change: revenue > 0 ? "+100%" : "0%",
      trend: revenue > 0 ? "up" as const : "neutral" as const,
      icon: defaultCards[0].icon,
    },
    {
      title: "Completed Orders",
      value: totalOrders.toString(),
      change: totalOrders > 0 ? "+100%" : "0%",
      trend: totalOrders > 0 ? "up" as const : "neutral" as const,
      icon: defaultCards[2].icon,
    },
    {
      title: "Average Order Value",
      value: totalOrders > 0 ? formatCurrency(revenue / totalOrders) : "$0.00",
      change: totalOrders > 0 ? "+100%" : "0%",
      trend: totalOrders > 0 ? "up" as const : "neutral" as const,
      icon: defaultCards[0].icon,
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: defaultCards[2].icon,
    },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
              <p className="text-sm text-muted-foreground mt-1">Track your revenue performance and trends.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card, i) => (
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
          </div>
        </main>
      </div>
    </div>
  )
}
