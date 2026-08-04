"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Avatar } from "../ui/avatar"

interface Activity {
  id: string
  title: string
  description: string
  time: string
  type: "order" | "customer" | "payment" | "alert"
  user?: {
    name: string
    avatar?: string
  }
}

interface ActivityListProps {
  activities: Activity[]
  className?: string
}

function ActivityListInner({ activities, className }: ActivityListProps) {
  const typeStyles = {
    order: "bg-accent/10 text-accent",
    customer: "bg-success-bg text-success",
    payment: "bg-warning-bg text-warning",
    alert: "bg-error-bg text-error",
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <a href="#" className="text-sm text-accent hover:underline">View all</a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="relative">
                {activity.user ? (
                  <Avatar src={activity.user.avatar} alt={activity.user.name} fallback={activity.user.name.charAt(0)} size="sm" />
                ) : (
                  <div className={cn("h-9 w-9 rounded-full flex items-center justify-center", typeStyles[activity.type])}>
                    <span className="text-xs font-bold uppercase">
                      {activity.type[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const defaultActivities = [
  {
    id: "1",
    title: "New order #1247",
    description: "Sarah Chen purchased 3 items totaling $249.99",
    time: "2 minutes ago",
    type: "order" as const,
    user: { name: "Sarah Chen", avatar: "" },
  },
  {
    id: "2",
    title: "Customer registered",
    description: "Marcus Johnson created a new account",
    time: "15 minutes ago",
    type: "customer" as const,
    user: { name: "Marcus Johnson", avatar: "" },
  },
  {
    id: "3",
    title: "Payment received",
    description: "Invoice #INV-2024-001 paid in full",
    time: "1 hour ago",
    type: "payment" as const,
  },
  {
    id: "4",
    title: "Low stock alert",
    description: "Product SKU-8821 is below threshold (3 units)",
    time: "2 hours ago",
    type: "alert" as const,
  },
  {
    id: "5",
    title: "New order #1246",
    description: "Elena Rodriguez purchased 1 item totaling $89.00",
    time: "3 hours ago",
    type: "order" as const,
    user: { name: "Elena Rodriguez", avatar: "" },
  },
]

export { ActivityListInner as ActivityList, defaultActivities }
