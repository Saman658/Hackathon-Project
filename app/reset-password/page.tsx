"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SupabaseBrowserClient = ReturnType<typeof createClient>

/**
 * A recovery link can land here in several shapes depending on the flow Supabase used:
 *   - `?code=...`                       (PKCE, exchanged for a session)
 *   - `?token_hash=...&type=recovery`   (verifyOtp)
 *   - `#access_token=...&refresh_token=...` (implicit flow)
 *   - `?error_description=...`          (expired/already-used link)
 * Without establishing a session from one of these, `updateUser({ password })` fails with
 * "Auth session missing!" and the password is never actually changed.
 * Returns an error message, or null when a usable recovery session exists.
 */
async function establishRecoverySession(supabase: SupabaseBrowserClient): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return null

  const url = new URL(window.location.href)
  const query = url.searchParams
  const hash = new URLSearchParams(url.hash.replace(/^#/, ""))

  const errorDescription = query.get("error_description") ?? hash.get("error_description")
  if (errorDescription) return errorDescription

  const code = query.get("code")
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    return error ? error.message : null
  }

  const tokenHash = query.get("token_hash") ?? query.get("token")
  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash })
    return error ? error.message : null
  }

  const accessToken = hash.get("access_token")
  const refreshToken = hash.get("refresh_token")
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return error ? error.message : null
  }

  return "This password reset link is invalid or has expired. Please request a new link."
}

export default function ResetPasswordPage() {
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")

  const supabase = createClient()

  React.useEffect(() => {
    let cancelled = false
    establishRecoverySession(createClient()).then((message) => {
      if (!cancelled && message) setError(message)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const sessionError = await establishRecoverySession(supabase)
      if (sessionError) {
        setError(sessionError)
        return
      }

      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess("Password updated successfully. Redirecting to login...")
        await supabase.auth.signOut()
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Reset your password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            {success && <p className="text-sm text-success">{success}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
