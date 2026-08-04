"use client"

import * as React from "react"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { ArrowRight } from "lucide-react"

interface HeroProps {
  onLoginClick: () => void
  className?: string
}

function HeroInner({ onLoginClick, className }: HeroProps) {
  return (
    <section className={cn("relative overflow-hidden pt-20 pb-32", className)}>
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-border-light via-background to-border-light" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium mb-8 shadow-sm animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
          </span>
          <span className="text-muted-foreground">Now with AI-powered analytics</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in">
          Manage your business
          <br />
          <span className="text-accent">with clarity</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
          Nexus brings together all your business operations in one elegant platform.
          Track customers, manage orders, and grow your revenue with powerful insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Button size="lg" onClick={onLoginClick} className="w-full sm:w-auto">
            Start for free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            Watch demo
          </Button>
        </div>

        <div className="mt-16 relative">
          <div className="rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
            <div className="bg-border-light border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-error/80" />
                <div className="h-3 w-3 rounded-full bg-warning/80" />
                <div className="h-3 w-3 rounded-full bg-success/80" />
              </div>
              <div className="flex-1 text-center">
                <div className="inline-flex items-center rounded-lg bg-border px-3 py-1 text-xs text-muted-foreground">
                  app.nexus.com/dashboard
                </div>
              </div>
            </div>
            <div className="p-6 bg-gradient-to-b from-surface to-border-light/50">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="h-2 w-16 bg-border rounded mb-3" />
                  <div className="h-8 w-24 bg-primary/10 rounded mb-2" />
                  <div className="h-2 w-12 bg-border rounded" />
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="h-2 w-20 bg-border rounded mb-3" />
                  <div className="h-24 bg-accent/10 rounded-lg relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 h-full p-2">
                      <div className="w-full bg-accent/30 rounded-t" style={{ height: "40%" }} />
                      <div className="w-full bg-accent/30 rounded-t" style={{ height: "60%" }} />
                      <div className="w-full bg-accent/30 rounded-t" style={{ height: "45%" }} />
                      <div className="w-full bg-accent/30 rounded-t" style={{ height: "80%" }} />
                      <div className="w-full bg-accent rounded-t" style={{ height: "65%" }} />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="h-2 w-12 bg-border rounded mb-3" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-border rounded" />
                    <div className="h-3 w-4/5 bg-border rounded" />
                    <div className="h-3 w-3/5 bg-border rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { HeroInner as Hero }
