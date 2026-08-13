"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard, defaultCards } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"

export default function RevenuePage() {
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
          </div>
        </main>
      </div>
    </div>
  )
}
