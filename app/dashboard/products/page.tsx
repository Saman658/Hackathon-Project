"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const products = [
  { id: "1", name: "Premium Plan", sku: "PLAN-PRE", price: "$49.00", stock: "Unlimited", status: "Active" },
  { id: "2", name: "Basic Plan", sku: "PLAN-BAS", price: "$19.00", stock: "Unlimited", status: "Active" },
  { id: "3", name: "Enterprise Plan", sku: "PLAN-ENT", price: "$149.00", stock: "Unlimited", status: "Active" },
  { id: "4", name: "Add-on Pack", sku: "ADD-001", price: "$9.00", stock: "500", status: "Active" },
  { id: "5", name: "Legacy Support", sku: "SUP-OLD", price: "$29.00", stock: "0", status: "Discontinued" },
]

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your product catalog and inventory.</p>
              </div>
              <Button>Add Product</Button>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{product.sku}</TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === "Active" ? "success" : "outline"}>
                          {product.status}
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
