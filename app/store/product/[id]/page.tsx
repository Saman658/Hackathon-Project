"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { products, type Product } from "@/lib/data/products"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Zap } from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const product = products.find((p) => p.id === params.id)

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onLoginClick={() => {}} />
        <main className="max-w-7xl mx-auto px-6 py-16">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-2">Product not found</h1>
              <p className="text-muted-foreground mb-6">The product you are looking for does not exist.</p>
              <Link href="/store">
                <Button>Back to Store</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => {}} />
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/store" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <Link href={`/store/product/${product.id}`} className="block">
              <div className="aspect-square w-full overflow-hidden bg-border-light md:aspect-auto md:h-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
            <div className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/store/product/${product.id}`} className="group">
                      <CardTitle className="text-2xl group-hover:text-accent transition-colors">{product.name}</CardTitle>
                    </Link>
                    <CardDescription className="mt-1">SKU: {product.sku}</CardDescription>
                  </div>
                  <Badge variant={product.status === "Active" ? "success" : "outline"}>
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-3xl font-bold">{product.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Stock</p>
                    <p className="text-2xl font-bold">{product.stock}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border mt-auto">
                  <Button variant="outline" className="flex-1">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button className="flex-1">
                    <Zap className="mr-2 h-4 w-4" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
