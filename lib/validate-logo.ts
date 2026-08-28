export function isValidLogoUrl(value: string): boolean {
  const v = (value || "").trim()
  if (!v) return true
  try {
    const url = new URL(v)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}
