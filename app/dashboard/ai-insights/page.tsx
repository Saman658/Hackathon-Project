"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/providers/auth-provider"
import { useStoreOrders } from "@/lib/hooks/use-store-orders"
import { createClient } from "@/lib/supabase/client"
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function AIInsightsPage() {
  const { user } = useAuth()
  const { orders, stats } = useStoreOrders(user?.id)
  const [productCount, setProductCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadProducts() {
      if (!user) return
      const supabase = createClient()
      const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
      setProductCount(count || 0)
      setLoading(false)
    }
    loadProducts()
  }, [user])

  const completedOrders = React.useMemo(
    () => orders.filter((o) => o.status === "Completed"),
    [orders]
  )

  const avgOrderValue = completedOrders.length > 0 ? stats.revenue / completedOrders.length : 0

  const cards = React.useMemo(
    () => [
      {
        title: "Total Orders",
        value: stats.total.toString(),
        change: stats.total > 0 ? "+100%" : "0%",
        trend: stats.total > 0 ? ("up" as const) : ("neutral" as const),
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        title: "Revenue",
        value: formatCurrency(stats.revenue),
        change: stats.revenue > 0 ? "+100%" : "0%",
        trend: stats.revenue > 0 ? ("up" as const) : ("neutral" as const),
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        title: "Products",
        value: productCount.toString(),
        change: productCount > 0 ? "Active" : "0",
        trend: productCount > 0 ? ("up" as const) : ("neutral" as const),
        icon: <Package className="h-5 w-5" />,
      },
      {
        title: "Avg Order Value",
        value: formatCurrency(avgOrderValue),
        change: avgOrderValue > 0 ? "+100%" : "0%",
        trend: avgOrderValue > 0 ? ("up" as const) : ("neutral" as const),
        icon: <TrendingUp className="h-5 w-5" />,
      },
    ],
    [stats, productCount, avgOrderValue]
  )

  const insights = React.useMemo(() => {
    const items: { title: string; description: string; severity: "success" | "warning" | "outline" | "default" }[] = []

    if (stats.pending > 0) {
      items.push({
        title: `${stats.pending} pending orders need attention`,
        description: "Follow up with customers to reduce cart abandonment and improve conversion rates.",
        severity: "warning",
      })
    }

    if (stats.completed > 0 && stats.pending === 0) {
      items.push({
        title: "Strong order completion rate",
        description: "All recent orders are completed. Keep maintaining the current checkout and delivery experience.",
        severity: "success",
      })
    }

    if (stats.revenue > 0 && productCount > 0) {
      items.push({
        title: "Revenue per product is healthy",
        description: `Your ${productCount} product${productCount > 1 ? "s" : ""} generated ${formatCurrency(stats.revenue)} in completed revenue. Consider expanding top sellers.`,
        severity: "success",
      })
    }

    if (stats.cancelled > 0) {
      items.push({
        title: `${stats.cancelled} order${stats.cancelled > 1 ? "s" : ""} were cancelled`,
        description: "Review cancellation reasons and adjust pricing, shipping, or product availability to reduce future cancellations.",
        severity: "outline",
      })
    }

    if (items.length === 0) {
      items.push({
        title: "No data available yet",
        description: "Start receiving orders to unlock AI-powered insights, forecasts, and recommendations.",
        severity: "outline",
      })
    }

    return items
  }, [stats, productCount])

  const recommendations = React.useMemo(() => {
    const items: { title: string; description: string }[] = []

    if (stats.pending > 0) {
      items.push({
        title: "Automate order reminders",
        description: "Send automated emails for pending orders to improve completion rate.",
      })
    }

    if (productCount < 5) {
      items.push({
        title: "Expand product catalog",
        description: "Add more products to increase average order value and customer engagement.",
      })
    }

    if (stats.revenue > 0 && stats.completed > 0) {
      items.push({
        title: "Launch a loyalty program",
        description: "Reward repeat customers to increase retention and lifetime value.",
      })
    }

    if (stats.cancelled > 0) {
      items.push({
        title: "Review cancellation patterns",
        description: "Analyze cancelled orders for common reasons and fix the root cause.",
      })
    }

    if (items.length === 0) {
      items.push({
        title: "Get started",
        description: "Add products and share your store to start collecting orders and insights.",
      })
    }

    return items
  }, [stats, productCount])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
              <p className="text-sm text-muted-foreground mt-1">Discover patterns and recommendations powered by AI.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card, i) => (
                <AnalyticsCard key={i} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Sales Forecast" description="AI-predicted revenue trends" />
              </div>
              <div>
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Key Insights</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">AI-detected patterns from your data</p>
                      </div>
                      <Lightbulb className="h-5 w-5 text-accent" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                          <div className="mt-0.5">
                            <AlertTriangle className="h-4 w-4 text-accent" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{insight.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                          <Badge variant={insight.severity} className="shrink-0">
                            {insight.severity === "success" ? "Good" : insight.severity === "warning" ? "Action" : "Info"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Anomaly Detection" description="Unusual patterns in your data" type="line" />
              </div>
              <div>
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Recommendations</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">Suggested actions to improve performance</p>
                      </div>
                      <TrendingUp className="h-5 w-5 text-success" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
                          <div className="mt-0.5">
                            <Users className="h-4 w-4 text-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{rec.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
