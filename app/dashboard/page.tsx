"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AnalyticsCard } from "@/components/dashboard/analytics-card"
import { ChartPlaceholder } from "@/components/dashboard/chart-placeholder"
import { ActivityList } from "@/components/dashboard/activity-list"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { useAuth } from "@/components/providers/auth-provider"
import { useStores } from "@/lib/stores-context"
import { Store } from "@/lib/data/stores"
import { useStoreOrders } from "@/lib/hooks/use-store-orders"
import { isValidLogoUrl } from "@/lib/validate-logo"
import { DollarSign, ShoppingCart, Clock, CheckCircle2 } from "lucide-react"

const statusStyles: Record<string, "success" | "warning" | "outline" | "default"> = {
  Completed: "success",
  Processing: "warning",
  Pending: "outline",
  Cancelled: "default",
  Shipped: "default",
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export default function DashboardPage() {
  const router = useRouter()
  const { profile, user } = useAuth()
  const { addStore, updateStore, stores } = useStores()
  const { orders, stats } = useStoreOrders(user?.id)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [successStore, setSuccessStore] = React.useState<Store | null>(null)
  const [createError, setCreateError] = React.useState<string | null>(null)

  const recentOrders = React.useMemo(
    () =>
      orders.slice(0, 5).map((order) => ({
        id: order.id,
        customer: order.customer.fullName,
        product: order.items[0]?.name || "Multiple items",
        amount: formatCurrency(order.total),
        status: order.status,
        date: new Date(order.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    [orders]
  )

  const cards = React.useMemo(
    () => [
      {
        title: "Total Revenue",
        value: formatCurrency(stats.revenue),
        change: stats.revenue > 0 ? "+100%" : "0%",
        trend: stats.revenue > 0 ? ("up" as const) : ("neutral" as const),
        icon: <DollarSign className="h-5 w-5" />,
      },
      {
        title: "Total Orders",
        value: stats.total.toString(),
        change: stats.total > 0 ? "+100%" : "0%",
        trend: stats.total > 0 ? ("up" as const) : ("neutral" as const),
        icon: <ShoppingCart className="h-5 w-5" />,
      },
      {
        title: "Pending Orders",
        value: stats.pending.toString(),
        change: stats.pending > 0 ? `${stats.pending} new` : "0",
        trend: stats.pending > 0 ? ("up" as const) : ("neutral" as const),
        icon: <Clock className="h-5 w-5" />,
      },
      {
        title: "Completed Orders",
        value: stats.completed.toString(),
        change: stats.completed > 0 ? "+100%" : "0%",
        trend: stats.completed > 0 ? ("up" as const) : ("neutral" as const),
        icon: <CheckCircle2 className="h-5 w-5" />,
      },
    ],
    [stats]
  )

  const activities = React.useMemo(
    () =>
      orders.slice(0, 5).map((order) => ({
        id: order.id,
        title: `Order ${order.id.slice(0, 8)}`,
        description: `${order.customer.fullName} • ${formatCurrency(order.total)}`,
        time: new Date(order.createdAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        type: order.status === "Completed" ? ("payment" as const) : order.status === "Cancelled" ? ("alert" as const) : ("order" as const),
        user: { name: order.customer.fullName, avatar: "" },
      })),
    [orders]
  )

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [logo, setLogo] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [heroTitle, setHeroTitle] = React.useState("")
  const [heroDescription, setHeroDescription] = React.useState("")

  const [errors, setErrors] = React.useState<{ name?: string; slug?: string; heroTitle?: string; heroDescription?: string; logo?: string }>({})

  const [editingStore, setEditingStore] = React.useState<Store | null>(null)
  const [editName, setEditName] = React.useState("")
  const [editDescription, setEditDescription] = React.useState("")
  const [editLogo, setEditLogo] = React.useState("")
  const [editSlug, setEditSlug] = React.useState("")
  const [editHeroTitle, setEditHeroTitle] = React.useState("")
  const [editHeroDescription, setEditHeroDescription] = React.useState("")
  const [editErrors, setEditErrors] = React.useState<{ name?: string; slug?: string; heroTitle?: string; heroDescription?: string; logo?: string }>({})
  const [editError, setEditError] = React.useState<string | null>(null)
  const [editSuccess, setEditSuccess] = React.useState(false)

  function resetForm() {
    setName("")
    setDescription("")
    setLogo("")
    setSlug("")
    setHeroTitle("")
    setHeroDescription("")
    setErrors({})
    setSuccessStore(null)
    setCreateError(null)
  }

  function resetEditForm() {
    setEditingStore(null)
    setEditName("")
    setEditDescription("")
    setEditLogo("")
    setEditSlug("")
    setEditHeroTitle("")
    setEditHeroDescription("")
    setEditErrors({})
    setEditError(null)
    setEditSuccess(false)
  }

  function handleEditOpenChange(open: boolean) {
    if (!open) {
      resetEditForm()
    }
    setEditModalOpen(open)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      resetForm()
    }
    setModalOpen(open)
  }

  function handleOpenEdit(store: Store) {
    setEditingStore(store)
    setEditName(store.name)
    setEditDescription(store.description)
    setEditLogo(store.logo)
    setEditSlug(store.slug)
    setEditHeroTitle(store.heroTitle)
    setEditHeroDescription(store.heroDescription)
    setEditErrors({})
    setEditError(null)
    setEditSuccess(false)
    setEditModalOpen(true)
  }

  function autoSlug(value: string) {
    const parts = value.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "").split("-")
    return parts.filter(Boolean).join("-")
  }

  function validate() {
    const newErrors: { name?: string; slug?: string; heroTitle?: string; heroDescription?: string; logo?: string } = {}
    if (!name.trim()) newErrors.name = "Store name is required"
    if (!slug.trim()) newErrors.slug = "Store slug is required"
    if (!heroTitle.trim()) newErrors.heroTitle = "Hero title is required"
    if (!heroDescription.trim()) newErrors.heroDescription = "Hero description is required"
    if (logo.trim() && !isValidLogoUrl(logo)) newErrors.logo = "Logo must be a valid image URL (https://…)"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validateEdit() {
    const newErrors: { name?: string; slug?: string; heroTitle?: string; heroDescription?: string; logo?: string } = {}
    if (!editName.trim()) newErrors.name = "Store name is required"
    if (!editSlug.trim()) newErrors.slug = "Store slug is required"
    if (!editHeroTitle.trim()) newErrors.heroTitle = "Hero title is required"
    if (!editHeroDescription.trim()) newErrors.heroDescription = "Hero description is required"
    if (editLogo.trim() && !isValidLogoUrl(editLogo)) newErrors.logo = "Logo must be a valid image URL (https://…)"
    setEditErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleCreate() {
    setCreateError(null)
    if (!validate()) return
    try {
      const created = await addStore({
        name: name.trim(),
        description: description.trim(),
        logo: logo.trim(),
        slug: slug.trim(),
        heroTitle: heroTitle.trim(),
        heroDescription: heroDescription.trim(),
      })
      if (created) {
        setSuccessStore(created)
      }
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create store")
    }
  }

  async function handleEdit() {
    setEditError(null)
    if (!validateEdit()) return
    if (!editingStore) return
    try {
      const updated = await updateStore({
        id: editingStore.id,
        name: editName.trim(),
        description: editDescription.trim(),
        logo: editLogo.trim(),
        slug: editSlug.trim(),
        heroTitle: editHeroTitle.trim(),
        heroDescription: editHeroDescription.trim(),
        userId: editingStore.userId,
      })
      if (updated) {
        setEditSuccess(true)
      }
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update store")
    }
  }

  const isSuccess = successStore !== null

  React.useEffect(() => {
    if (isSuccess && successStore?.slug) {
      const t = setTimeout(() => router.push(`/store/${successStore.slug}`), 1500)
      return () => clearTimeout(t)
    }
  }, [isSuccess, successStore, router])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome{profile?.name ? `, ${profile.name}` : ""}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {profile?.business_name || "Here's what's happening with your business today."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {stores.length > 0 && (
                  <Button variant="secondary" onClick={() => handleOpenEdit(stores[0])}>Edit Store</Button>
                )}
                <Button onClick={() => { resetForm(); setModalOpen(true) }}>Create Store</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((card, i) => (
                <AnalyticsCard key={i} {...card} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartPlaceholder title="Revenue Overview" description="Monthly revenue breakdown" />
              </div>
              <div>
                <ChartPlaceholder title="Traffic Sources" description="Where visitors come from" type="donut" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                  <div className="flex items-center justify-between p-6 pb-4">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <Button variant="ghost" size="sm" className="text-accent hover:text-accent-hover">
                      View all
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No orders yet. Customer orders will appear here in real time.
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>{order.product}</TableCell>
                            <TableCell>{order.amount}</TableCell>
                            <TableCell>
                              <Badge variant={statusStyles[order.status] || "default"}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{order.date}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div>
                {activities.length === 0 ? (
                  <div className="rounded-2xl border border-border bg-surface p-8">
                    <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                    <p className="text-sm text-muted-foreground">
                       No orders yet. When customers place orders, you&#39;ll see them here in real time.
                    </p>
                  </div>
                ) : (
                  <ActivityList activities={activities} />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <Modal open={modalOpen} onOpenChange={handleOpenChange} maxWidth="max-w-2xl">
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>{isSuccess ? "Store Created" : "Create Store"}</ModalTitle>
          </ModalHeader>
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-16 w-16 rounded-full bg-success-bg text-success flex items-center justify-center mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-medium mb-1">Your store has been created successfully.</p>
              <p className="text-sm text-muted-foreground mb-6">You can continue setting up your dashboard or preview your new store.</p>
              <div className="rounded-2xl border border-border bg-surface p-4 w-full flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl border border-border overflow-hidden bg-border-light shrink-0">
                  {successStore.logo && isValidLogoUrl(successStore.logo) ? (
                    <img src={successStore.logo} alt={successStore.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No logo</div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold truncate">{successStore.name}</p>
                  <p className="text-sm text-muted-foreground truncate">/{successStore.slug}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6 w-full">
                <Button variant="secondary" onClick={() => handleOpenChange(false)}>Done</Button>
                <Button onClick={() => { handleOpenChange(false); router.push(`/store/${successStore.slug}`); }}>View Store</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleCreate() }} className="flex flex-col flex-1 min-h-0">
              <ModalBody className="space-y-4 flex-1 min-h-0 overflow-y-auto">
                {createError && (
                  <div className="rounded-xl border border-error/30 bg-error-bg px-4 py-3">
                    <p className="text-sm text-error">{createError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Store Name <span className="text-error">*</span></label>
                    <Input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)) }} placeholder="e.g. Fatima Fashion" error={errors.name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Store Slug <span className="text-error">*</span></label>
                    <Input value={slug} onChange={(e) => setSlug(autoSlug(e.target.value))} placeholder="e.g. fatima-fashion" error={errors.slug} />
                    <p className="text-xs text-muted-foreground mt-1.5">Used in your store URL.</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Store Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe your store"
                    rows={3}
                    className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Logo / Image URL</label>
                  <Input value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="https://example.com/logo.png" error={errors.logo} />
                  {errors.logo && <p className="text-xs text-error mt-1.5">{errors.logo}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hero Title <span className="text-error">*</span></label>
                  <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="e.g. Summer Collection 2026" error={errors.heroTitle} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hero Description <span className="text-error">*</span></label>
                  <textarea
                    value={heroDescription}
                    onChange={(e) => setHeroDescription(e.target.value)}
                    placeholder="A short description shown on your store hero"
                    rows={3}
                    className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                  />
                </div>

                {(name || heroTitle || heroDescription || logo) && (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                    <div className="rounded-xl border border-border overflow-hidden bg-border-light">
                      {logo && isValidLogoUrl(logo) ? (
                        <img src={logo} alt="Store logo preview" className="h-40 w-full object-cover" />
                      ) : (
                        <div className="h-40 w-full flex items-center justify-center text-muted-foreground text-sm">No logo provided</div>
                      )}
                      <div className="p-4">
                        <p className="text-lg font-semibold">{heroTitle || "Your Hero Title"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{heroDescription || "Your hero description will appear here."}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => handleOpenChange(false)}>Cancel</Button>
                <Button type="submit">Create Store</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>

      <Modal open={editModalOpen} onOpenChange={handleEditOpenChange} maxWidth="max-w-2xl">
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <ModalTitle>{editSuccess ? "Store Updated" : "Edit Store"}</ModalTitle>
          </ModalHeader>
          {editSuccess ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-16 w-16 rounded-full bg-success-bg text-success flex items-center justify-center mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-medium mb-1">Your store has been updated successfully.</p>
              <div className="flex items-center justify-end gap-3 mt-6 w-full">
                <Button onClick={() => handleEditOpenChange(false)}>Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleEdit() }} className="flex flex-col flex-1 min-h-0">
              <ModalBody className="space-y-4 flex-1 min-h-0 overflow-y-auto">
                {editError && (
                  <div className="rounded-xl border border-error/30 bg-error-bg px-4 py-3">
                    <p className="text-sm text-error">{editError}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Store Name <span className="text-error">*</span></label>
                    <Input value={editName} onChange={(e) => { setEditName(e.target.value); if (!editSlug) setEditSlug(autoSlug(e.target.value)) }} placeholder="e.g. Fatima Fashion" error={editErrors.name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Store Slug <span className="text-error">*</span></label>
                    <Input value={editSlug} onChange={(e) => setEditSlug(autoSlug(e.target.value))} placeholder="e.g. fatima-fashion" error={editErrors.slug} />
                    <p className="text-xs text-muted-foreground mt-1.5">Used in your store URL.</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Store Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Briefly describe your store"
                    rows={3}
                    className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Logo / Image URL</label>
                  <Input value={editLogo} onChange={(e) => setEditLogo(e.target.value)} placeholder="https://example.com/logo.png" error={editErrors.logo} />
                  {editErrors.logo && <p className="text-xs text-error mt-1.5">{editErrors.logo}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hero Title <span className="text-error">*</span></label>
                  <Input value={editHeroTitle} onChange={(e) => setEditHeroTitle(e.target.value)} placeholder="e.g. Summer Collection 2026" error={editErrors.heroTitle} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Hero Description <span className="text-error">*</span></label>
                  <textarea
                    value={editHeroDescription}
                    onChange={(e) => setEditHeroDescription(e.target.value)}
                    placeholder="A short description shown on your store hero"
                    rows={3}
                    className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                  />
                </div>

                {(editName || editHeroTitle || editHeroDescription || editLogo) && (
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Preview</p>
                    <div className="rounded-xl border border-border overflow-hidden bg-border-light">
                      {editLogo && isValidLogoUrl(editLogo) ? (
                        <img src={editLogo} alt="Store logo preview" className="h-40 w-full object-cover" />
                      ) : (
                        <div className="h-40 w-full flex items-center justify-center text-muted-foreground text-sm">No logo provided</div>
                      )}
                      <div className="p-4">
                        <p className="text-lg font-semibold">{editHeroTitle || "Your Hero Title"}</p>
                        <p className="text-sm text-muted-foreground mt-1">{editHeroDescription || "Your hero description will appear here."}</p>
                      </div>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="secondary" type="button" onClick={() => handleEditOpenChange(false)}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

