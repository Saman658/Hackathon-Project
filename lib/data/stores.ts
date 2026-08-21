export type Store = {
  id: string
  name: string
  slug: string
  description: string
  logo: string
  heroTitle: string
  heroDescription: string
}

export const mockStore: Store = {
  id: "nexus",
  name: "Nexus Store",
  slug: "nexus-store",
  description: "Browse our plans and add-ons designed to help your business grow.",
  logo: "",
  heroTitle: "Nexus Store",
  heroDescription: "Browse our plans and add-ons designed to help your business grow.",
}

export const stores: Store[] = [mockStore]

export function getStoreBySlug(slug: string): Store | undefined {
  return stores.find((store) => store.slug === slug)
}

export function generateStoreId(): string {
  return `store_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
