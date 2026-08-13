"use client"

import * as React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { ProfileModal } from "@/components/auth/profile-modal"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, loading, refreshProfile } = useAuth()
  const [showProfileModal, setShowProfileModal] = React.useState(false)

  React.useEffect(() => {
    if (!loading && profile && !profile.name) {
      setShowProfileModal(true)
    }
  }, [loading, profile])

  return (
    <div className="flex min-h-screen">
      {children}
      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
        title="Complete Your Profile"
        onSaved={refreshProfile}
      />
    </div>
  )
}
