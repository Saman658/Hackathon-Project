"use client"

import * as React from "react"
import { cn } from "./button"

interface DropdownProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
}

function Dropdown({ trigger, children, align = "right" }: DropdownProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px] rounded-xl bg-surface-elevated border border-border shadow-xl py-1.5",
            "animate-scale-in",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  destructive?: boolean
}

function DropdownItem({ icon, children, destructive, className, ...props }: DropdownItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors",
        destructive ? "text-error hover:bg-error-bg" : "text-foreground hover:bg-border-light",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  )
}

function DropdownSeparator() {
  return <div className="my-1.5 h-px bg-border" />
}

export { Dropdown, DropdownItem, DropdownSeparator }
