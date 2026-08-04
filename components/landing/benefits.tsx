"use client"

import * as React from "react"
import { cn } from "../ui/button"
import { Check } from "lucide-react"

interface Benefit {
  title: string
  description: string
  metric?: string
}

interface BenefitsProps {
  benefits: Benefit[]
  className?: string
}

function BenefitsInner({ benefits, className }: BenefitsProps) {
  return (
    <section id="benefits" className={cn("py-24", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Built for teams that move fast
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of companies that trust Nexus to power their operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-surface p-8 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-success-bg flex items-center justify-center shrink-0">
                  <Check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  {benefit.metric && (
                    <p className="text-2xl font-bold text-accent mt-3">{benefit.metric}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultBenefits = [
  {
    title: "Increase productivity by 40%",
    description: "Streamlined workflows and automated processes help your team accomplish more in less time.",
    metric: "+40%",
  },
  {
    title: "Reduce operational costs",
    description: "Eliminate redundant tools and consolidate your tech stack into one powerful platform.",
    metric: "-35%",
  },
  {
    title: "Make data-driven decisions",
    description: "Access real-time analytics and actionable insights to guide your strategic choices.",
    metric: "2.5x",
  },
  {
    title: "Scale without limits",
    description: "Infrastructure that grows with your business, from startup to enterprise without rewrites.",
    metric: "99.9%",
  },
]

export { BenefitsInner as Benefits, defaultBenefits }
