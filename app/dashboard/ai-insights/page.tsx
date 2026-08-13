"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"

export default function AIInsightsPage() {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Sales Forecast" description="AI-predicted revenue trends" />
              </div>
              <div>
                <ChartPlaceholder title="Customer Segments" description="AI-detected audience clusters" type="donut" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Anomaly Detection" description="Unusual patterns in your data" type="line" />
              </div>
              <div>
                <ChartPlaceholder title="Recommendations" description="Suggested actions to improve performance" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
