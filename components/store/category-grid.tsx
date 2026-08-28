import * as React from "react"
import Link from "next/link"
import { cn } from "@/components/ui/button"

interface Category {
  name: string
  image: string
  slug: string
}

interface CategoryGridProps {
  categories: Category[]
  storeSlug: string
  className?: string
  activeCategory?: string | null
}

function CategoryGridInner({ categories, storeSlug, className, activeCategory }: CategoryGridProps) {
  return (
    <section className={cn("py-12", className)}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const isActive = activeCategory === category.slug
            return (
              <Link
                key={category.slug}
                href={`/store/${storeSlug}?category=${category.slug}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg",
                  isActive
                    ? "border-primary ring-2 ring-primary shadow-lg"
                    : "bg-surface border-border"
                )}
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-border-light">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white tracking-tight">
                    {category.name}
                  </h3>
                  {isActive && (
                    <p className="text-sm text-white/80 mt-1">Selected</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { CategoryGridInner as CategoryGrid }
