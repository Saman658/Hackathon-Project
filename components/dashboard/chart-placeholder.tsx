"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

interface ChartPlaceholderProps {
  title: string
  description?: string
  className?: string
  type?: "line" | "bar" | "donut"
}

function ChartPlaceholderInner({ title, description, className, type = "bar" }: ChartPlaceholderProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent" />
            <div className="h-2 w-2 rounded-full bg-accent/40" />
            <div className="h-2 w-2 rounded-full bg-accent/20" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="7d" className="w-full">
          <TabsList className="bg-border-light h-9 p-0.5">
            <TabsTrigger value="24h" className="text-xs h-7 px-3">24h</TabsTrigger>
            <TabsTrigger value="7d" className="text-xs h-7 px-3">7d</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs h-7 px-3">30d</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs h-7 px-3">90d</TabsTrigger>
          </TabsList>
          <TabsContent value="24h" className="mt-4">
            <ChartVisual type={type} />
          </TabsContent>
          <TabsContent value="7d" className="mt-4">
            <ChartVisual type={type} />
          </TabsContent>
          <TabsContent value="30d" className="mt-4">
            <ChartVisual type={type} />
          </TabsContent>
          <TabsContent value="90d" className="mt-4">
            <ChartVisual type={type} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ChartVisual({ type }: { type: string }) {
  if (type === "line") {
    return (
      <div className="h-[240px] w-full relative">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,150 C50,140 80,100 120,110 C160,120 200,80 240,90 C280,100 320,60 360,70 C380,75 400,50 400,50 L400,200 L0,200 Z"
            fill="url(#gradient)"
          />
          <path
            d="M0,150 C50,140 80,100 120,110 C160,120 200,80 240,90 C280,100 320,60 360,70 C380,75 400,50 400,50"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="400" cy="50" r="4" fill="var(--accent)" />
        </svg>
      </div>
    )
  }
  if (type === "donut") {
    return (
      <div className="h-[240px] w-full flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="h-48 w-48">
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--border-light)" strokeWidth="24" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="var(--accent)" strokeWidth="24"
            strokeDasharray="340 440" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 100 100)" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="var(--accent)" strokeWidth="24"
            strokeDasharray="200 314" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 100 100)" opacity="0.5" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold">$48K</span>
          <span className="text-sm text-muted-foreground">Total</span>
        </div>
      </div>
    )
  }
  return (
    <div className="h-[240px] w-full flex items-end gap-2 px-2">
      {Array.from({ length: 12 }).map((_, i) => {
        const heights = [40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 95]
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-lg bg-accent/80 hover:bg-accent transition-all duration-200"
              style={{ height: `${heights[i]}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

export { ChartPlaceholderInner as ChartPlaceholder }
