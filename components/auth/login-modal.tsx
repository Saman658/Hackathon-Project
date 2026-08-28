"use client"

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

  /* eslint-disable react-hooks/set-state-in-effect */
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
  /* eslint-enable react-hooks/set-state-in-effect */

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
      const { error } = await supabase.auth.signInWithPassword({ email, password })
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
      if (error) {
        setError(error.message)
        return
      }
      if (data?.user && !data.user.email_confirmed_at) {
        setError("Please check your email to confirm your account before signing in.")
        setNeedsEmailConfirmation(true)
      } else {
        onOpenChange(false)
        window.location.href = "/dashboard"
      }
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
          {mode === "signup" ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleGoogleOAuth} disabled={loading} className="w-full text-sm whitespace-nowrap">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.16 3.31v2.77h3.49c2.04-1.88 3.23-4.64 3.23-7.94z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.49-2.77c-.98.66-2.23 1.06-3.79 1.06-2.91 0-5.37-1.96-6.25-4.63H2.18v2.84C3.99 20.53 7.68 23 12 23z"/>
                  <path d="M5.75 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.72-.62z"/>
                  <path d="M12 5.38c1.64 0 3.11.56 4.27 1.67l3.21-3.21C17.45 2.09 14.97 1 12 1 7.68 1 3.99 3.47 2.18 7.07l3.57 2.84c.88-2.67 3.34-4.53 6.25-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" onClick={handleGithubOAuth} disabled={loading} className="w-full text-sm whitespace-nowrap">
                <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </Button>
            </div>
          ) : (
            <>
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
              <form onSubmit={handleSignIn} className="space-y-4">
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
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-accent hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : "Sign In"}
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
                <Button variant="outline" onClick={handleGoogleOAuth} disabled={loading} className="w-full text-sm whitespace-nowrap">
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.03 2.53-2.16 3.31v2.77h3.49c2.04-1.88 3.23-4.64 3.23-7.94z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.49-2.77c-.98.66-2.23 1.06-3.79 1.06-2.91 0-5.37-1.96-6.25-4.63H2.18v2.84C3.99 20.53 7.68 23 12 23z"/>
                    <path d="M5.75 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.72-.62z"/>
                    <path d="M12 5.38c1.64 0 3.11.56 4.27 1.67l3.21-3.21C17.45 2.09 14.97 1 12 1 7.68 1 3.99 3.47 2.18 7.07l3.57 2.84c.88-2.67 3.34-4.53 6.25-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" onClick={handleGithubOAuth} disabled={loading} className="w-full text-sm whitespace-nowrap">
                  <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  GitHub
                </Button>
              </div>
            </>
          )}
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