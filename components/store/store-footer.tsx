import Link from "next/link"
import { cn } from "../ui/button"
import { Logo } from "../ui/logo"

interface StoreFooterProps {
  store?: {
    name: string
    slug?: string
    description?: string
  }
  className?: string
}

function StoreFooterInner({ store, className }: StoreFooterProps) {
  const footerLinks = {
    Shop: ["All Products", "Featured", "New Arrivals", "Deals"],
    Support: ["Contact", "FAQ", "Shipping", "Returns"],
    Company: ["About", "Blog", "Careers", "Press"],
    Legal: ["Privacy", "Terms", "Security"],
  }

  return (
    <footer className={cn("border-t border-border bg-surface", className)}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link href={`/store/${store?.slug || ""}`} className="flex items-center gap-2.5 mb-4">
              <Logo size={36} />
              <span className="font-semibold text-lg tracking-tight">{store?.name || "Store"}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {store?.description || "Your one-stop shop for quality products."}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-3">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2025 {store?.name || "Store"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { StoreFooterInner as StoreFooter }
