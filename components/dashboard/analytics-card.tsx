"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { ArrowUpRight, ArrowDownRight, DollarSign, Users, ShoppingCart, TrendingUp } from "lucide-react"

interface AnalyticsCardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down" | "neutral"
  icon?: React.ReactNode
  className?: string
}

function AnalyticsCardInner({ title, value, change, trend, icon, className }: AnalyticsCardProps) {
  const trendColors = {
    up: "text-success bg-success-bg",
    down: "text-error bg-error-bg",
    neutral: "text-muted-foreground bg-border-light",
  }

  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : null

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-10 w-10 rounded-xl bg-border-light flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={cn("text-xs font-medium border-0", trendColors[trend || "neutral"])}>
                  {TrendIcon && <TrendIcon className="h-3 w-3 mr-0.5" />}
                  {change}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const defaultCards = [
  {
    title: "Total Revenue",
    value: "$48,295",
    change: "+12.5%",
    trend: "up" as const,
    icon: <DollarSign className="h-5 w-5" />,
  },
  {
    title: "Active Customers",
    value: "2,847",
    change: "+8.2%",
    trend: "up" as const,
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Total Orders",
    value: "1,245",
    change: "-3.1%",
    trend: "down" as const,
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Conversion Rate",
    value: "3.24%",
    change: "+1.2%",
    trend: "up" as const,
    icon: <TrendingUp className="h-5 w-5" />,
  },
]

export { AnalyticsCardInner as AnalyticsCard, defaultCards }
