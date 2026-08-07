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
  const [showForgotPassword, setShowForgotPassword] = React.useState(false)
  const [forgotPasswordEmailSent, setForgotPasswordEmailSent] = React.useState(false)
  const [resendingConfirmation, setResendingConfirmation] = React.useState(false)
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = React.useState(false)

  const supabase = createClient()

  React.useEffect(() => {
    if (!open) {
      setEmail("")
      setPassword("")
      setError("")
      setMode("signin")
      setShowForgotPassword(false)
      setForgotPasswordEmailSent(false)
      setResendingConfirmation(false)
      setNeedsEmailConfirmation(false)
    }
  }, [open])

  const getFriendlyErrorMessage = (message: string): string => {
    if (message.includes("Invalid login credentials") || message.includes("Invalid credentials")) {
      return "Incorrect email or password"
    }
    if (message.includes("Email not confirmed")) {
      return "Please confirm your email before signing in"
    }
    return message
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setNeedsEmailConfirmation(false)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      // console.log("signInWithPassword data:", data)
      // console.log("signInWithPassword error:", error)
      if (error) {
        const friendlyMessage = getFriendlyErrorMessage(error.message)
        setError(friendlyMessage)
        if (friendlyMessage.includes("confirm your email")) {
          setNeedsEmailConfirmation(true)
        }
        return
      }
      onOpenChange(false)
      window.location.href = "/dashboard"
    } catch (err) {
      console.error("signInWithPassword exception:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      console.log("signUp data:", data)
      console.log("signUp error:", error)
      if (error) {
        setError(error.message)
        return
      }
      onOpenChange(false)
    } catch (err) {
      console.error("signUp exception:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      console.log("resetPasswordForEmail error:", error)
      if (error) {
        setError(error.message)
      } else {
        setForgotPasswordEmailSent(true)
      }
    } catch (err) {
      console.error("resetPasswordForEmail exception:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    setResendingConfirmation(true)
    setError("")
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email })
      if (error) {
        setError(error.message)
      } else {
        setError("Confirmation email sent. Please check your inbox.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setResendingConfirmation(false)
    }
  }

  const handleGoogleOAuth = async () => {
    setLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error("Google OAuth exception:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGithubOAuth = async () => {
    setLoading(true)
    setError("")
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error("GitHub OAuth exception:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (showForgotPassword) {
    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Reset Password</ModalTitle>
          </ModalHeader>
          <ModalBody>
            {error && <p className="text-sm text-error">{error}</p>}
            {forgotPasswordEmailSent && (
              <p className="text-sm text-success">
                Check your email for a link to reset your password.
              </p>
            )}
            {!forgotPasswordEmailSent && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => {
                setShowForgotPassword(false)
                setForgotPasswordEmailSent(false)
              }}
            >
              Back to Sign In
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{mode === "signin" ? "Sign In" : "Create Account"}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {error && <p className="text-sm text-error">{error}</p>}
          {needsEmailConfirmation && (
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={resendingConfirmation}
              className="text-sm text-accent hover:underline font-medium"
            >
              {resendingConfirmation ? "Sending..." : "Resend confirmation email"}
            </button>
          )}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
            />
            {mode === "signin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-accent hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
              </div>
            )}
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