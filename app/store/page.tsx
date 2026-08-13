"use client"

import * as React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { products, type Product } from "@/lib/data/products"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function StorePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => {}} />
      <main>
        <section className="relative overflow-hidden pt-20 pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-border-light via-background to-border-light" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Nexus Store
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse our plans and add-ons designed to help your business grow.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/store/chat">
                <Button size="lg">Store Assistant</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
                  <Link href={`/store/product/${product.id}`} className="block">
                    <div className="h-[320px] w-full overflow-hidden bg-border-light">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Link href={`/store/product/${product.id}`} className="group">
                        <CardTitle className="text-base group-hover:text-accent transition-colors">{product.name}</CardTitle>
                      </Link>
                      <Badge variant={product.status === "Active" ? "success" : "outline"}>
                        {product.status}
                      </Badge>
                    </div>
                    <CardDescription>SKU: {product.sku}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="mt-auto space-y-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Price</p>
                          <p className="text-2xl font-bold">{product.price}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Stock</p>
                          <p className="text-sm font-medium">{product.stock}</p>
                        </div>
                      </div>
                      <Link href={`/store/product/${product.id}`} className="block w-full">
                        <Button className="w-full">
                          View Product
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
