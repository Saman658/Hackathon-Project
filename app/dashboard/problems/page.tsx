"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProblemsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Problems</h1>
              <p className="text-sm text-muted-foreground mt-1">Track and resolve reported issues.</p>
            </div>
            <EmptyState
              icon={<AlertTriangle className="h-6 w-6" />}
              title="No problems found"
              description="All systems are operating normally. Issues will appear here when reported."
              action={<Button variant="secondary">Report an issue</Button>}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
