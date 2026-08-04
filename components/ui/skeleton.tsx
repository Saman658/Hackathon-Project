import { cn } from "./button"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl skeleton", className)}
      {...props}
    />
  )
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn("h-4", j === 0 ? "w-1/4" : "w-1/6")} />
          ))}
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton, ChartSkeleton }
