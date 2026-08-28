import * as React from "react"
import { cn } from "@/components/ui/button"

interface StoreInitialProps {
  name: string
  className?: string
}

function getInitial(name: string): string {
  const trimmed = (name || "").trim()
  if (!trimmed) return "?"
  return trimmed.charAt(0).toUpperCase()
}

export function StoreInitial({ name, className }: StoreInitialProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-accent text-white font-semibold select-none",
        className
      )}
    >
      {getInitial(name)}
    </div>
  )
}
