"use client"

import * as React from "react"
import { cn } from "./button"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
    }
    const [imgError, setImgError] = React.useState(false)

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-border font-medium",
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-muted-foreground">{fallback || alt?.charAt(0) || "?"}</span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
