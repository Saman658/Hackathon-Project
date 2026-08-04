"use client"

import * as React from "react"
import { cn } from "./button"

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue>({
  value: "",
  onValueChange: () => {},
})

interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ value, defaultValue, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "")
  const currentValue = value ?? internalValue

  const handleChange = (newValue: string) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

function useTabs() {
  return React.useContext(TabsContext)
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex items-center justify-center rounded-xl bg-border-light p-0.5", className)}
      {...props}
    />
  )
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabs()
  const isSelected = selectedValue === value

  return (
    <button
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

function TabsContent({ value, className, ...props }: TabsContentProps) {
  const { value: selectedValue } = useTabs()

  if (selectedValue !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn("mt-2 focus-visible:outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
