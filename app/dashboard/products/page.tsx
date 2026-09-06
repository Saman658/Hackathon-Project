"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from "@/components/ui/modal"
import { EmptyState } from "@/components/ui/empty-state"
import type { Product } from "@/lib/data/products"
import { toProduct, toDatabaseProduct } from "@/lib/data/products"
import { getStoresFromSupabase, verifyStoreOwnership } from "@/lib/data/stores"
import { Pencil, Trash2 } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { createClient } from "@/lib/supabase/client"
import type { DatabaseProduct } from "@/lib/data/products"

const emptyStateIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
)

const placeholderIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
)

export default function ProductsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [modalOpen, setModalOpen] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = React.useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [stock, setStock] = React.useState("")
  const [image, setImage] = React.useState<string | null>(null)
  const [images, setImages] = React.useState<string[]>([])
  const [status, setStatus] = React.useState("Active")
  const [storeId, setStoreId] = React.useState("")
  const [active, setActive] = React.useState(true)
  const [userStores, setUserStores] = React.useState<{ id: string; name: string; slug: string }[]>([])

  const [errors, setErrors] = React.useState<{ name?: string; price?: string; stock?: string }>({})

  const filteredProducts = React.useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return products
    return products.filter((p) => {
      const haystack = `${p.name} ${p.sku} ${p.status}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [products, searchQuery])

  const loadProducts = React.useCallback(async () => {
    if (!user) return
    if (userStores.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    const supabase = createClient()
    const ownedStoreIds = userStores.map((s) => s.id)

    let query = supabase
      .from("products")
      .select("*")
      .in("store_id", ownedStoreIds)

    if (storeId && ownedStoreIds.includes(storeId)) {
      query = query.eq("store_id", storeId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else if (data) {
      const mapped = data.map(toProduct)
      setProducts(mapped)
      setError(null)
    }
    setLoading(false)
  }, [user, storeId, userStores])

  const loadStores = React.useCallback(async () => {
    if (!user) return
    const allStores = await getStoresFromSupabase(user.id)
    const myStores = allStores.filter((s) => s.userId === user.id)
    setUserStores(myStores.map((s) => ({ id: s.id, name: s.name, slug: s.slug })))
    setStoreId((prev) => {
      if (myStores.length > 0 && !prev) {
        return myStores[0].id
      }
      return prev
    })
  }, [user])

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!user) {
      setProducts([])
      setUserStores([])
      setStoreId("")
      setLoading(false)
      return
    }
    loadProducts()
  }, [loadProducts, user])
  /* eslint-enable react-hooks/set-state-in-effect */

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (!user) {
      setUserStores([])
      setStoreId("")
      return
    }
    loadStores()
  }, [loadStores, user])
  /* eslint-enable react-hooks/set-state-in-effect */

  function loadForm(product?: Product) {
    if (product) {
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price)
      setStock(product.stock)
      setImage(product.image)
      setImages(product.images || [])
      setStatus(product.status)
      setStoreId(product.storeId || (userStores[0]?.id || ""))
      setActive(product.active)
    } else {
      setName("")
      setDescription("")
      setPrice("")
      setStock("")
      setImage(null)
      setImages([])
      setStatus("Active")
      setStoreId(userStores[0]?.id || "")
      setActive(true)
    }
    setErrors({})
  }

  function openAddModal() {
    setEditingProduct(null)
    loadForm()
    setModalOpen(true)
  }

  function openEditModal(product: Product) {
    setEditingProduct(product)
    loadForm(product)
    setModalOpen(true)
  }

  function openDeleteModal(product: Product) {
    setDeleteProductId(product.id)
    setDeleteError(null)
    setDeleteModalOpen(true)
  }

  async function confirmDelete() {
    if (!deleteProductId || !user) return
    const product = products.find((p) => p.id === deleteProductId)
    if (!product) return
    setDeleting(true)
    setDeleteError(null)
    const supabase = createClient()
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteProductId)
      .eq("user_id", user.id)
      .eq("store_id", product.storeId)

    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      return
    }

    setProducts((prev) => prev.filter((p) => p.id !== deleteProductId))
    setDeleteProductId(null)
    setDeleteModalOpen(false)
    setDeleting(false)
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setEditingProduct(null)
      loadForm()
    }
    setModalOpen(open)
  }

  function validate() {
    const newErrors: { name?: string; price?: string; stock?: string } = {}
    if (!name.trim()) newErrors.name = "Product name is required"
    if (!price.trim()) newErrors.price = "Price is required"
    if (!stock.trim()) newErrors.stock = "Stock is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !user) return

    if (!storeId || !userStores.some((s) => s.id === storeId)) {
      setError("Please select a valid store. The selected store does not belong to you.")
      return
    }

    const storeOwned = await verifyStoreOwnership(storeId, user.id)
    if (!storeOwned) {
      setError("Store verification failed. The selected store does not belong to you.")
      return
    }

    setSaving(true)
    setError(null)
    const supabase = createClient()
    const dbProduct = toDatabaseProduct({
      ...(editingProduct || {}),
      user_id: user.id,
      store_id: storeId,
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      stock: stock.trim(),
      image: image?.trim() || "",
      status,
    })

    const buildProduct = (db: DatabaseProduct): Product => {
      const base = toProduct(db)
      return {
        ...base,
        storeId: db.store_id || base.storeId,
        active,
        images,
      }
    }

    if (editingProduct) {
      const { data, error } = await supabase
        .from("products")
        .update(dbProduct)
        .eq("id", editingProduct.id)
        .eq("user_id", user.id)
        .select("*")
        .single()

      if (!error && data) {
        const updated = buildProduct(data as DatabaseProduct)
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert(dbProduct)
        .select("*")
        .single()

      if (!error && data) {
        const created = buildProduct(data as DatabaseProduct)
        setProducts((prev) => [created, ...prev])
        setSearchQuery("")
      }
    }

    setEditingProduct(null)
    loadForm()
    setModalOpen(false)
    setSaving(false)
  }

  const isEditing = editingProduct !== null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                  <Badge variant="default" size="sm">{filteredProducts.length} total</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Manage your product catalog and inventory.</p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Search by name, SKU or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64"
                />
                <Button onClick={openAddModal} className="shrink-0">Add Product</Button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface overflow-hidden">
              {loading ? (
                <EmptyState
                  icon={emptyStateIcon}
                  title="Loading products"
                  description="Fetching your product catalog..."
                />
              ) : error ? (
                <EmptyState
                  icon={emptyStateIcon}
                  title="Error loading products"
                  description={error}
                />
              ) : filteredProducts.length === 0 ? (
                <EmptyState
                  icon={emptyStateIcon}
                  title="No products found"
                  description="Try adjusting your search or add a new product to get started."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg border border-border overflow-hidden bg-border-light shrink-0">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  {placeholderIcon}
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{product.sku}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.status === "Active" ? "success" : "outline"}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(product)}
                              className="h-8 w-8 p-0"
                              aria-label={`Edit ${product.name}`}
                              title={`Edit ${product.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteModal(product)}
                              className="h-8 w-8 p-0 border-error text-error hover:bg-error-bg"
                              aria-label={`Delete ${product.name}`}
                              title={`Delete ${product.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </main>
      </div>

      <Modal open={modalOpen} onOpenChange={handleOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{isEditing ? "Edit Product" : "Add Product"}</ModalTitle>
          </ModalHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <ModalBody className="space-y-4 flex-1 overflow-y-auto min-h-0">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Product Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter product name" error={errors.name} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                  className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Price</label>
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $49.00" error={errors.price} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Stock</label>
                  <Input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="e.g. 100" error={errors.stock} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Image URL</label>
                <Input value={image || ""} onChange={(e) => setImage(e.target.value || null)} placeholder="https://example.com/image.jpg" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Additional Image URLs</label>
                <textarea
                  value={images.join("\n")}
                  onChange={(e) => setImages(e.target.value.split("\n").map((url) => url.trim()).filter(Boolean))}
                  placeholder="https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
                  rows={3}
                  className="flex w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200 resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1.5">One URL per line. Optional.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Store</label>
                  <select
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="flex w-full rounded-xl border border-border bg-transparent h-11 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  >
                    {userStores.map((store) => (
                      <option key={store.id} value={store.id}>{store.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Active</label>
                  <select
                    value={active ? "true" : "false"}
                    onChange={(e) => setActive(e.target.value === "true")}
                    className="flex w-full rounded-xl border border-border bg-transparent h-11 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              </ModalBody>
              <div className="px-6 pb-6">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex w-full rounded-xl border border-border bg-transparent h-11 px-4 text-base focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Discontinued">Discontinued</option>
                </select>
              </div>
              <ModalFooter>
              <Button variant="secondary" type="button" onClick={() => handleOpenChange(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>{isEditing ? "Save Changes" : "Add Product"}</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <Modal open={deleteModalOpen} onOpenChange={(open) => {
        setDeleteModalOpen(open)
        if (!open) {
          setDeleteProductId(null)
          setDeleteError(null)
        }
      }}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Delete Product?</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{products.find((p) => p.id === deleteProductId)?.name}</span>?
            </p>
            <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            {deleteError && (
              <p className="text-sm text-error mt-3">{deleteError}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}


