"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "../ui/button"
import { cn } from "../ui/button"
import { Logo } from "../ui/logo"

interface NavbarProps {
  onLoginClick: () => void
  className?: string
}

function NavbarInner({ onLoginClick, className }: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "bg-surface/80 backdrop-blur-md border-b border-border shadow-sm" : "bg-transparent",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Logo size={36} />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#benefits" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Benefits
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Testimonials
          </Link>
          <Link href="#faq" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onLoginClick} className="hidden md:inline-flex">
            Sign in
          </Button>
          <Button onClick={onLoginClick} className="hidden md:inline-flex">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 rounded-lg">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  )
}

export { NavbarInner as Navbar }
