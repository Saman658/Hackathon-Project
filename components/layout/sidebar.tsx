"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useStores } from "@/lib/stores-context"
import { cn } from "../ui/button"
import { Button } from "../ui/button"
import { Logo } from "../ui/logo"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Brain,
  Store,
  AlertTriangle,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/problems", label: "Problems", icon: AlertTriangle },
  { href: "/dashboard/ai-insights", label: "AI Insights", icon: Brain },
  { href: "/store", label: "Store", icon: Store },
]

const bottomNavItems = [

  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help", icon: HelpCircle },
]

interface SidebarProps {
  className?: string
}

function SidebarInner({ className }: SidebarProps) {
  // compact sidebar spacing
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { stores, activeStoreId, setActiveStoreId, loading: storesLoading } = useStores()

  /**
   * Selecting a store switches the *dashboard* workspace, it never navigates
   * to the public `/store/<slug>` storefront. The id is persisted by
   * `setActiveStoreId` (lib/stores-context), and every dashboard page reads it
   * from there, so the whole workspace (products, orders, revenue, AI insights)
   * follows the selection. Dashboard URLs stay unchanged.
   */
  const handleSelectStore = React.useCallback(
    (storeId: string) => {
      if (!storeId) return
      setActiveStoreId(storeId)
      router.push("/dashboard")
    },
    [router, setActiveStoreId]
  )

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-surface transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center">
            <Logo size={36} />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hidden md:flex"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2">
        <div className="space-y-1">
          {storesLoading ? (
            !collapsed && <p className="px-3 pb-2 text-xs text-muted-foreground">Loading stores...</p>
          ) : stores.length > 1 ? (
            <div className="mb-4">
              {!collapsed && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Your Stores
                </p>
              )}
              <div className="space-y-1">
                {stores.map((store) => {
                  const isActive = store.id === activeStoreId
                  return (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => handleSelectStore(store.id)}
                      aria-current={isActive ? "true" : undefined}
                      title={collapsed ? store.name : undefined}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 text-left",
                        isActive
                          ? "bg-border-light text-foreground"
                          : "text-muted-foreground hover:bg-border-light hover:text-foreground",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <Store className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{store.name}</span>
                          {isActive && <Check className="h-4 w-4 shrink-0 text-accent" />}
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-border-light hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", collapsed && "h-5 w-5")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Support
            </p>
          )}
          {bottomNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-border-light hover:text-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={async () => {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = "/"
          }}
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-border-light hover:text-foreground transition-all duration-200 w-full",
            collapsed && "justify-center px-2"
          )}
        >
          <X className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  )
}

export { SidebarInner as Sidebar }
