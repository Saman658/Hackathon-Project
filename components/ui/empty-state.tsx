import { cn } from "./button"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      {icon && (
        <div className="mb-4 rounded-2xl bg-border-light p-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  )
}

export { EmptyState }
