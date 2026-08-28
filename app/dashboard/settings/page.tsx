"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"
import { upsertProfile, updatePasswordWithCurrent, updateEmail, signOut } from "@/lib/supabase/auth"

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  
  const [name, setName] = React.useState("")
  const [businessName, setBusinessName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  
  const [profileLoading, setProfileLoading] = React.useState(false)
  const [passwordLoading, setPasswordLoading] = React.useState(false)
  const [emailLoading, setEmailLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "")
      setBusinessName(profile.business_name || "")
      setEmail(profile.email || user?.email || "")
    }
  }, [profile, user])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    setMessage(null)
    try {
      await upsertProfile({ name, business_name: businessName })
      await refreshProfile()
      setMessage({ type: "success", text: "Profile updated successfully." })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update profile" })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordLoading(true)
    setMessage(null)
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" })
      setPasswordLoading(false)
      return
    }
    
    if (!currentPassword) {
      setMessage({ type: "error", text: "Please enter your current password" })
      setPasswordLoading(false)
      return
    }
    
    try {
      await updatePasswordWithCurrent(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage({ type: "success", text: "Password updated successfully." })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update password" })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setMessage(null)
    try {
      await updateEmail(email)
      setMessage({ type: "success", text: "Email update confirmation sent. Please check your inbox." })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to update email" })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl border ${message.type === "success" ? "bg-success-bg border-success text-success" : "bg-error-bg border-error text-error"}`}>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Business Name</label>
                    <Input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Acme Inc."
                    />
                  </div>
                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Email</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEmailUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email Address</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Changing your email will require verification.</p>
                  </div>
                  <Button type="submit" disabled={emailLoading}>
                    {emailLoading ? "Updating..." : "Update Email"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Current Password</label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" disabled={passwordLoading}>
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="danger" onClick={handleLogout}>Log out</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
