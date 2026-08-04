"use client"

import * as React from "react"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { Badge } from "../ui/badge"
import { Check } from "lucide-react"

interface Plan {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

interface PricingProps {
  plans: Plan[]
  className?: string
}

function PricingInner({ plans, className }: PricingProps) {
  return (
    <section id="pricing" className={cn("py-24 bg-surface", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative rounded-3xl border border-border bg-surface p-8 transition-all duration-300 hover:shadow-lg",
                plan.popular && "border-accent shadow-lg scale-[1.02]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Most Popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-muted-foreground ml-1">/{plan.period}</span>
                )}
              </div>
              <Button
                variant={plan.popular ? "primary" : "secondary"}
                className="w-full mb-8"
              >
                {plan.cta}
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultPlans = [
  {
    name: "Starter",
    price: "$19",
    period: "month",
    description: "Perfect for small teams getting started.",
    features: ["Up to 5 team members", "Basic analytics", "1,000 customers", "Email support", "5GB storage"],
    cta: "Start free trial",
  },
  {
    name: "Professional",
    price: "$49",
    period: "month",
    description: "For growing teams that need more power.",
    features: [
      "Up to 20 team members",
      "Advanced analytics",
      "10,000 customers",
      "Priority support",
      "50GB storage",
      "Custom integrations",
      "API access",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$149",
    period: "month",
    description: "For organizations that need full control.",
    features: [
      "Unlimited team members",
      "Enterprise analytics",
      "Unlimited customers",
      "24/7 dedicated support",
      "Unlimited storage",
      "Custom integrations",
      "Advanced API access",
      "SSO & SAML",
      "Audit logs",
    ],
    cta: "Contact sales",
  },
]

export { PricingInner as Pricing, defaultPlans }
