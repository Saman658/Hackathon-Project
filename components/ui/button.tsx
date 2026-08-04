import * as React from "react"

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ")
}

const buttonVariants = {
  variant: {
    primary: "bg-primary text-primary-foreground hover:bg-primary-light shadow-sm",
    secondary: "bg-surface border border-border text-foreground hover:bg-border-light shadow-sm",
    outline: "border border-border bg-transparent hover:bg-border-light",
    ghost: "hover:bg-border-light text-foreground",
    danger: "bg-error text-white hover:bg-red-600 shadow-sm",
  },
  size: {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    icon: "h-10 w-10",
  },
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant
  size?: keyof typeof buttonVariants.size
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants, cn }
