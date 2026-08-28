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

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!loading && profile && !profile.name) {
      setShowProfileModal(true)
    }
  }, [loading, profile])
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="flex min-h-screen">
      {children}
      <ProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
        defaultName={profile?.name || ""}
        defaultBusinessName={profile?.business_name || ""}
        title="Complete Your Profile"
        onSaved={refreshProfile}
      />
    </div>
  )
}
