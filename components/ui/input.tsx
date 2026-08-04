import * as React from "react"
import { cn } from "./button"

const inputVariants = {
  variant: {
    default: "border-border bg-surface focus:border-accent focus:ring-accent/20",
    filled: "border-transparent bg-border-light focus:bg-surface focus:border-accent focus:ring-accent/20",
  },
  size: {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-base",
    lg: "h-14 px-5 text-lg",
  },
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: keyof typeof inputVariants.variant
  size?: keyof typeof inputVariants.size
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", size = "md", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            "flex w-full rounded-xl border bg-transparent transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error && "border-error focus:border-error focus:ring-error/20",
            inputVariants.variant[variant],
            inputVariants.size[size],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
