"use client"

import * as React from "react"
import { cn } from "./button"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

function Modal({ open, onOpenChange, children }: ModalProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-md mx-4 animate-scale-in">
        {children}
      </div>
    </div>
  )
}

type ModalContentProps = React.HTMLAttributes<HTMLDivElement>

function ModalContent({ className, ...props }: ModalContentProps) {
  return (
    <div
      className={cn(
        "w-full rounded-3xl bg-surface border border-border shadow-2xl",
        className
      )}
      {...props}
    />
  )
}

type ModalHeaderProps = React.HTMLAttributes<HTMLDivElement>

function ModalHeader({ className, ...props }: ModalHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between p-6 pb-4", className)}
      {...props}
    />
  )
}

type ModalTitleProps = React.HTMLAttributes<HTMLHeadingElement>

function ModalTitle({ className, ...props }: ModalTitleProps) {
  return (
    <h2
      className={cn("text-xl font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

type ModalBodyProps = React.HTMLAttributes<HTMLDivElement>

function ModalBody({ className, ...props }: ModalBodyProps) {
  return <div className={cn("px-6 pb-6", className)} {...props} />
}

type ModalFooterProps = React.HTMLAttributes<HTMLDivElement>

function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      className={cn("flex items-center justify-end gap-3 p-6 pt-4", className)}
      {...props}
    />
  )
}

export { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter }
