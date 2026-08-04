"use client"

import * as React from "react"
import { cn } from "./button"
import { Button } from "./button"

interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  onClose: (id: string) => void
}

const variantStyles = {
  default: "bg-surface border-border",
  success: "bg-success-bg border-success/20",
  error: "bg-error-bg border-error/20",
  warning: "bg-warning-bg border-warning/20",
}

const variantIcons = {
  default: null,
  success: (
    <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
}

function Toast({ id, title, description, variant = "default", onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(id), 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-full max-w-sm rounded-xl border p-4 shadow-lg animate-slide-in",
        variantStyles[variant]
      )}
      role="alert"
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 rounded-lg"
        onClick={() => onClose(id)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    </div>
  )
}

interface ToastContextType {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id" | "onClose">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = React.useCallback((toast: Omit<ToastProps, "id" | "onClose">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }])
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}

export { Toast, ToastProvider, useToast }
