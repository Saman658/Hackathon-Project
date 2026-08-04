"use client"

import { Globe } from "lucide-react"
import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const [mode, setMode] = React.useState<"signin" | "signup">("signin")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const supabase = createClient()

  React.useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setError("")
      setMode("signin")
    }
  }, [open])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onOpenChange(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onOpenChange(false)
    }
  }

  const handleGoogleOAuth = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleGithubOAuth = async () => {
    setLoading(true)
    setError("")
    const { error } = await supabase.auth.signInWithOAuth({ provider: "github" })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{mode === "signin" ? "Sign In" : "Create Account"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {error && <p className="text-sm text-error">{error}</p>}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-surface text-muted-foreground">Or continue with</span>
            </div>
          </div>
         <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoogleOAuth} disabled={loading}>
              <Globe className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" onClick={handleGithubOAuth} disabled={loading}>
              <Globe className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create an account" : "Already have an account? Sign In"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}