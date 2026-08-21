import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Store } from "@/lib/data/stores"

interface StoreHeroProps {
  store: Store
  ctaLabel?: string
  ctaHref?: string
  className?: string
}

function StoreHeroInner({ store, ctaLabel = "Shop Now", ctaHref = "/store#products", className }: StoreHeroProps) {
  return (
    <section className={cn("relative overflow-hidden pt-20 pb-16", className)}>
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-border-light via-background to-border-light" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {store.heroTitle || store.name}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          {store.heroDescription || store.description}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href={ctaHref}>
            <Button size="lg">
              {ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export { StoreHeroInner as StoreHero }
