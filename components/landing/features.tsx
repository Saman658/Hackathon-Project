"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { BarChart3, Users, Shield, Zap, Globe, Clock } from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

interface FeaturesProps {
  features: Feature[]
  className?: string
}

function FeaturesInner({ features, className }: FeaturesProps) {
  return (
    <section id="features" className={cn("py-24 bg-surface", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Everything you need to scale
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to help you manage every aspect of your business with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:shadow-lg hover:border-accent/20 hover:-translate-y-1"
            >
              <div className="h-12 w-12 rounded-xl bg-border-light flex items-center justify-center mb-5 group-hover:bg-accent/10 transition-colors">
                <div className="text-accent">{feature.icon}</div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultFeatures = [
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Advanced Analytics",
    description: "Gain deep insights into your business performance with real-time dashboards and customizable reports.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Customer Management",
    description: "Build stronger relationships with a complete view of every customer interaction and history.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance standards keep your data safe and your business protected.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description: "Optimized performance ensures your team can work at the speed of business without delays.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Scale",
    description: "Built to handle operations across regions, currencies, and time zones effortlessly.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Real-time Sync",
    description: "Changes propagate instantly across all devices and team members, keeping everyone aligned.",
  },
]

export { FeaturesInner as Features, defaultFeatures }
