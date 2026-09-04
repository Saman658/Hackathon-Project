"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { StoreNavbar } from "@/components/store/store-navbar"
import { StoreFooter } from "@/components/store/store-footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Product } from "@/lib/data/products"
import Link from "next/link"
import { MessageSquare, ArrowLeft } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

function ChatContent({ highlightProductId, products }: { highlightProductId: string | undefined; products: Product[] }) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Nexus Store Assistant. Ask me about our products, pricing, or availability.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (highlightProductId && products.length > 0) {
      const product = products.find((p) => p.id === highlightProductId)
      if (product) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `You're viewing ${product.name}. ${product.name} (${product.sku}) costs ${product.price}. Stock: ${product.stock}. Status: ${product.status}.`,
          },
        ])
      }
    }
  }, [highlightProductId, products])
  /* eslint-enable react-hooks/set-state-in-effect */

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getProductResponse = (query: string): string => {
    const q = query.toLowerCase()

    if (q.includes("available") || q.includes("in stock") || q.includes("stock")) {
      const available = products.filter((p) => p.status === "Active")
      if (available.length === 0) return "There are no available products right now."
      return `Available products: ${available.map((p) => p.name).join(", ")}.`
    }

    if (q.includes("price") || q.includes("cost") || q.includes("how much")) {
      const matched = products.filter((p) => q.includes(p.name.toLowerCase()))
      if (matched.length > 0) {
        return matched.map((p) => `${p.name}: ${p.price}`).join("\n")
      }
      return products.map((p) => `${p.name}: ${p.price}`).join("\n")
    }

    if (q.includes("show") || q.includes("list") || q.includes("what") && q.includes("product")) {
      return `We offer: ${products.map((p) => `${p.name} (${p.sku})`).join(", ")}.`
    }

    if (q.includes("sku")) {
      return products.map((p) => `${p.name}: ${p.sku}`).join("\n")
    }

    return "I can help with product availability, pricing, SKUs, and stock. Try asking: What products are available? What is the price of Premium Plan?"
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const response = getProductResponse(userMessage.content)
    setMessages((prev) => [...prev, { role: "assistant", content: response }])
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Store Assistant</CardTitle>
            <CardDescription>Ask about products, prices, and availability.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-[400px] overflow-y-auto rounded-xl border border-border bg-surface p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-border-light text-foreground"
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm bg-border-light text-foreground">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="mt-4 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about our products..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SearchParamsWrapper({ products }: { products: Product[] }) {
  const searchParams = useSearchParams()
  const highlightProductId = searchParams.get("product") || undefined
  return <ChatContent highlightProductId={highlightProductId} products={products} />
}

export default function ChatPage() {
  const [store, setStore] = React.useState<{ id: string; name: string; slug: string; description: string; logo: string; heroTitle: string; heroDescription: string } | null>(null)
  const [products, setProducts] = React.useState<Product[]>([])

  React.useEffect(() => {
    async function load() {
      const res = await fetch("/api/store", { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        setStore(json.store)
        setProducts(json.products)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {store ? <StoreNavbar store={store} /> : null}
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/store" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>
        <React.Suspense fallback={<div className="text-center text-muted-foreground py-12">Loading chat...</div>}>
          <SearchParamsWrapper products={products} />
        </React.Suspense>
      </main>
      {store ? <StoreFooter store={store} /> : null}
    </div>
  )
}
