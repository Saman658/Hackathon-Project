"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { useAuth } from "@/components/providers/auth-provider"
import { useStoreOrders } from "@/lib/hooks/use-store-orders"
import { DollarSign, ShoppingCart, Clock, TrendingUp } from "lucide-react"

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function RevenuePage() {
  const { user } = useAuth()
  const { stats } = useStoreOrders(user?.id)

  const cards = React.useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(stats.revenue),
        change: stats.revenue > 0 ? "+100%" : "0%",
        trend: stats.revenue > 0 ? ("up" as const) : ("neutral" as const),
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        title: "Completed Orders",
        value: stats.completed.toString(),
        change: stats.completed > 0 ? "+100%" : "0%",
        trend: stats.completed > 0 ? ("up" as const) : ("neutral" as const),
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        title: "Average Order Value",
        value: stats.completed > 0 ? formatCurrency(stats.averageOrderValue) : "$0.00",
        change: stats.completed > 0 ? "+100%" : "0%",
        trend: stats.completed > 0 ? ("up" as const) : ("neutral" as const),
        icon: <TrendingUp className="h-5 w-5" />,
      },
      {
        title: "Pending Orders",
        value: stats.pending.toString(),
        change: stats.pending > 0 ? `${stats.pending} pending` : "0",
        trend: stats.pending > 0 ? ("up" as const) : ("neutral" as const),
        icon: <Clock className="h-5 w-5" />,
      },
    ],
    [stats]
  )

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
