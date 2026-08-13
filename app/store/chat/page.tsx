"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { products, type Product } from "@/lib/data/products"
import Link from "next/link"
import { MessageSquare, ArrowLeft } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

function getProductResponse(query: string, highlightProductId?: string): string {
  const q = query.toLowerCase()

  if (highlightProductId) {
    const product = products.find((p) => p.id === highlightProductId)
    if (product) {
      return `${product.name} (${product.sku}) costs ${product.price}. Stock: ${product.stock}. Status: ${product.status}.`
    }
  }

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

export default function ChatPage() {
  const searchParams = useSearchParams()
  const highlightProductId = searchParams.get("product") || undefined
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm the Nexus Store Assistant. Ask me about our products, pricing, or availability.",
    },
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (highlightProductId) {
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
  }, [highlightProductId])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 300))

    const response = getProductResponse(userMessage.content, highlightProductId)
    setMessages((prev) => [...prev, { role: "assistant", content: response }])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLoginClick={() => {}} />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-6">
          <Link href="/store" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Store
          </Link>
        </div>

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
      </main>
      <Footer />
    </div>
  )
}
