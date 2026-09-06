"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"
import { cn } from "../ui/button"
import { Button } from "../ui/button"
import { Avatar } from "../ui/avatar"
import {
  Dropdown,
  DropdownItem,
  DropdownSeparator,
} from "../ui/dropdown"
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react"
import { Sidebar } from "./sidebar"
import { useAuth } from "@/components/providers/auth-provider"
import { ProfileModal } from "@/components/auth/profile-modal"

const notifications = [
  { id: 1, title: "New order received", time: "2 min ago", read: false },
  { id: 2, title: "Customer feedback submitted", time: "15 min ago", read: false },
  { id: 3, title: "Inventory alert: Low stock", time: "1 hour ago", read: true },
  { id: 4, title: "Weekly report generated", time: "3 hours ago", read: true },
]

interface HeaderProps {
  className?: string
}

function HeaderInner({ className }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [profileModalOpen, setProfileModalOpen] = React.useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const unreadCount = notifications.filter((n) => !n.read).length
  const { user, profile, signOut, refreshProfile } = useAuth()

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname === "/dashboard/customers") return "Customers"
    if (pathname === "/dashboard/orders") return "Orders"
    if (pathname === "/dashboard/products") return "Products"
    if (pathname === "/dashboard/problems") return "Problems"
    if (pathname === "/dashboard/ai-insights") return "AI Insights"
    return "Dashboard"
  }

  const displayName = profile?.name || user?.email?.split("@")[0] || "User"
  const displayEmail = profile?.email || user?.email || ""
  const displayBusiness = profile?.business_name || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center justify-between h-16 px-6 border-b border-border bg-surface/80 backdrop-blur-md",
          className
        )}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-64 rounded-xl border border-border bg-border-light pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-accent transition-all"
            />
          </div>

          <Dropdown
            trigger={
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            }
            align="right"
          >
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            {notifications.map((notification) => (
              <DropdownItem key={notification.id} className="flex flex-col items-start gap-1">
                <span className={cn("text-sm", !notification.read && "font-semibold")}>
                  {notification.title}
                </span>
                <span className="text-xs text-muted-foreground">{notification.time}</span>
              </DropdownItem>
            ))}
            <DropdownSeparator />
            <DropdownItem>View all notifications</DropdownItem>
          </Dropdown>

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 cursor-pointer hover:bg-border-light rounded-xl px-2 py-1.5 transition-colors">
                <Avatar src="" alt={displayName} fallback={initials} size="sm" />
                <span className="hidden md:inline text-sm font-medium leading-none whitespace-nowrap">{displayName}</span>
                <span className="hidden md:inline text-xs text-muted-foreground leading-none whitespace-nowrap">
                  {displayBusiness || displayEmail}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </div>
            }
            align="right"
          >
            <div className="px-4 py-2 border-b border-border">
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground">{displayEmail}</p>
              {displayBusiness && (
                <p className="text-xs text-muted-foreground">{displayBusiness}</p>
              )}
            </div>
            <DropdownItem onClick={() => setProfileModalOpen(true)}>Profile</DropdownItem>
            <DropdownItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownItem>
            <DropdownSeparator />
            <DropdownItem destructive onClick={handleLogout}>Log out</DropdownItem>
          </Dropdown>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-[260px] animate-slide-in">
            <Sidebar />
          </div>
        </div>
      )}

      <ProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        defaultName={profile?.name || ""}
        defaultBusinessName={profile?.business_name || ""}
        defaultEmail={profile?.email || user?.email || ""}
        onSaved={refreshProfile}
      />
    </>
  )
}

export { HeaderInner as Header }
