
"use client"

import * as React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Profile = {
  id: string
  name: string | null
  business_name: string | null
  email: string | null
  is_active: boolean
  created_at: string
}

export default function CustomersPage() {
  const { profile } = useAuth()

  const [profiles, setProfiles] = React.useState<Profile[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null)

  const isAdmin = profile?.is_admin === true

  React.useEffect(() => {
    if (!isAdmin) {
      setLoading(false)
      return
    }

    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/admin/users")

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || "Failed to fetch users")
        }

        const json = await res.json()
        setProfiles(json.profiles ?? [])
      } catch (err) {
        console.error("Failed to load users:", err)
        setError(
          err instanceof Error ? err.message : "Failed to load users"
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [isAdmin])

  const toggleStatus = async (
    id: string,
    currentStatus: boolean
  ) => {
    setUpdatingId(id)
    setError(null)

    try {
      const res = await fetch(
        `/api/admin/users/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: !currentStatus,
          }),
        }
      )

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          data.error || "Failed to update status"
        )
      }

      if (data.profile) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === id ? data.profile : p
          )
        )
      }
    } catch (err) {
      console.error("Failed to update user status:", err)

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update user status"
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const total = profiles.length
  const active = profiles.filter(
    (p) => p.is_active
  ).length
  const inactive = total - active

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />

        <div className="flex flex-1 flex-col">
          <Header />

          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              <h1 className="text-2xl font-bold">
                Customers
              </h1>

              <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
                <p className="text-muted-foreground">
                  You do not have permission to view this page.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold">
                Customers
              </h1>

              <p className="mt-1 text-muted-foreground">
                Manage your customer base and track engagement.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <p className="mb-1 text-sm text-muted-foreground">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {total}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="mb-1 text-sm text-muted-foreground">
                    Active
                  </p>
                  <p className="text-2xl font-bold">
                    {active}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="mb-1 text-sm text-muted-foreground">
                    Inactive
                  </p>
                  <p className="text-2xl font-bold">
                    {inactive}
                  </p>
                </CardContent>
              </Card>
            </div>

            {error && (
              <div className="rounded-xl border border-error bg-error-bg p-4 text-error">
                <p className="text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        Loading users...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading && profiles.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loading &&
                    profiles.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.name || "—"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {p.business_name || "—"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {p.email || "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              p.is_active
                                ? "success"
                                : "outline"
                            }
                          >
                            {p.is_active
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            variant={
                              p.is_active
                                ? "outline"
                                : "primary"
                            }
                            disabled={
                              updatingId === p.id
                            }
                            onClick={() =>
                              toggleStatus(
                                p.id,
                                p.is_active
                              )
                            }
                          >
                            {updatingId === p.id
                              ? "Updating..."
                              : p.is_active
                                ? "Deactivate"
                                : "Activate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
