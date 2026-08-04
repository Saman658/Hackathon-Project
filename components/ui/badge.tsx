import * as React from "react"
import { cn } from "./button"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "outline"
  size?: "sm" | "md"
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => {
    const variants = {
      default: "bg-border text-foreground",
      success: "bg-success-bg text-success",
      warning: "bg-warning-bg text-warning",
      error: "bg-error-bg text-error",
      outline: "border border-border bg-transparent text-muted-foreground",
    }
    const sizes = {
      sm: "px-2.5 py-0.5 text-xs",
      md: "px-3 py-1 text-sm",
    }
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center rounded-full font-medium", variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
