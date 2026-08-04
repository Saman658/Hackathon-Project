"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


const customers = [
  { id: "1", name: "Sarah Chen", email: "sarah@example.com", plan: "Enterprise", spent: "$4,280", status: "Active" },
  { id: "2", name: "Marcus Johnson", email: "marcus@example.com", plan: "Professional", spent: "$1,560", status: "Active" },
  { id: "3", name: "Elena Rodriguez", email: "elena@example.com", plan: "Starter", spent: "$380", status: "Active" },
  { id: "4", name: "David Kim", email: "david@example.com", plan: "Enterprise", spent: "$3,920", status: "Inactive" },
  { id: "5", name: "Lisa Wang", email: "lisa@example.com", plan: "Professional", spent: "$1,240", status: "Active" },
  { id: "6", name: "James Wilson", email: "james@example.com", plan: "Starter", spent: "$290", status: "Active" },
]

export default function CustomersPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your customer base and track engagement.</p>
              </div>
              <Button>Add Customer</Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Customers</p>
                  <p className="text-2xl font-bold">2,847</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Active This Month</p>
                  <p className="text-2xl font-bold">1,923</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Revenue</p>
                  <p className="text-2xl font-bold">$1,847</p>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                      <TableCell>{customer.plan}</TableCell>
                      <TableCell>{customer.spent}</TableCell>
                      <TableCell>
                        <Badge variant={customer.status === "Active" ? "success" : "outline"}>
                          {customer.status}
                        </Badge>
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
