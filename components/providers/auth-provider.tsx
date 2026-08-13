"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { getCurrentUser, getProfile, upsertProfile, signOut } from "@/lib/supabase/auth"

interface UserProfile {
  id: string
  name: string | null
  business_name: string | null
  email: string | null
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface AuthContextType {
  user: { id: string; email?: string } | null
  profile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [initialized, setInitialized] = React.useState(false)

  const refreshProfile = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser ? { id: currentUser.id, email: currentUser.email ?? undefined } : null)
    
    if (currentUser) {
      const userProfile = await getProfile()
      setProfile(userProfile)
    } else {
      setProfile(null)
    }
  }

  React.useEffect(() => {
    let mounted = true

    const init = async () => {
      await refreshProfile()
      if (mounted) setLoading(false)
      setInitialized(true)
    }

    init()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? undefined } : null)
      
      if (session?.user) {
        const userProfile = await getProfile()
        if (mounted) setProfile(userProfile)
      } else {
        if (mounted) setProfile(null)
      }
      
      if (!initialized) setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [initialized])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
