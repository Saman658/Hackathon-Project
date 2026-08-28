"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/store/cart-context"
import type { Store } from "@/lib/data/stores"
import { StoreInitial } from "@/components/store/store-initial"

interface StoreNavbarProps {
  store: Store
  className?: string
}

function StoreNavbarInner({ store, className }: StoreNavbarProps) {
  const { cartCount } = useCart()

  return (
    <nav className={cn("sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md", className)}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/store/${store.slug}`} className="flex items-center">
            <StoreInitial name={store.name} className="h-8 w-8 text-sm" />
          </Link>
          <Link href={`/store/${store.slug}`} className="font-semibold text-lg tracking-tight">
            {store.name}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link href={`/store/${store.slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href={`/store/${store.slug}#products`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Products
          </Link>
          <div className="relative">
            <Link href={`/store/${store.slug}/cart`} className="inline-flex">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export { StoreNavbarInner as StoreNavbar }
