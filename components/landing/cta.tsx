"use client"

import * as React from "react"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { ArrowRight } from "lucide-react"

interface CTAProps {
  onLoginClick: () => void
  className?: string
}

function CTAInner({ onLoginClick, className }: CTAProps) {
  return (
    <section className={cn("py-24 relative overflow-hidden", className)}>
      <div className="absolute inset-0 -z-10 bg-primary" />
      <div className="absolute inset-0 -z-10 opacity-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
      </div>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground mb-6">
          Ready to transform your business?
        </h2>
        <p className="text-lg text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
          Join thousands of teams already using Nexus to streamline operations and drive growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={onLoginClick}
            className="bg-accent text-accent-foreground hover:bg-accent-hover w-full sm:w-auto"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto"
          >
            Schedule a demo
          </Button>
        </div>
      </div>
    </section>
  )
}

export { CTAInner as CTA }
