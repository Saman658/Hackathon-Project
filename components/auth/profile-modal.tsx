"use client"

import * as React from "react"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { upsertProfile } from "@/lib/supabase/auth"

interface ProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName?: string
  defaultBusinessName?: string
  defaultEmail?: string
  title?: string
  onSaved?: () => void
}

export function ProfileModal({ 
  open, 
  onOpenChange, 
  defaultName = "", 
  defaultBusinessName = "", 
  defaultEmail = "",
  title = "Edit Profile",
  onSaved 
}: ProfileModalProps) {
  const [name, setName] = React.useState(defaultName)
  const [businessName, setBusinessName] = React.useState(defaultBusinessName)
  const [email] = React.useState(defaultEmail)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (open) {
      setName(defaultName)
      setBusinessName(defaultBusinessName)
      setError("")
      setSuccess(false)
    }
  }, [open, defaultName, defaultBusinessName])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      await upsertProfile({ name, business_name: businessName })
      setSuccess(true)
      onSaved?.()
      setTimeout(() => {
        onOpenChange(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          {error && <p className="text-sm text-error mb-4">{error}</p>}
          {success && (
            <p className="text-sm text-success mb-4">Profile saved successfully!</p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Business Name (optional)</label>
              <Input
                type="text"
                placeholder="Acme Inc."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input
                type="email"
                value={email}
                readOnly
                disabled
                className="bg-border-light"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
