import { chromium } from "playwright"

const EXPECTED = [
  "Hamza Ismail 3PC Printed Lawn Suit",
  "Chevron 3-Piece Ladies Suit",
  "Digital Printed 3-Piece Suit",
]

const URL = "http://localhost:3000/store/mahrukh-store"

const browser = await chromium.launch()
const ctx = await browser.newContext({ bypassCSP: true })
const page = await ctx.newPage()

const consoleErrors = []
page.on("pageerror", (err) => consoleErrors.push("pageerror: " + err.message))
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push("console.error: " + msg.text())
})

const apiResponses = []
page.on("response", async (resp) => {
  const u = resp.url()
  if (u.includes("/api/store/")) {
    try {
      const body = await resp.json()
      apiResponses.push({ url: u, status: resp.status(), products: body?.products?.map((p) => p.name) || [], store: body?.store?.name })
    } catch (e) {
      apiResponses.push({ url: u, status: resp.status(), parseError: String(e) })
    }
  }
})

await page.goto(URL, { waitUntil: "networkidle" })

// Hard refresh to bypass any cache
await page.reload({ waitUntil: "networkidle" })

// wait for product cards
await page.waitForSelector("text=MAHRUKH", { timeout: 15000 }).catch(() => {})
await page.waitForTimeout(1500)

const visibleNames = await page.evaluate(() => {
  const cards = Array.from(document.querySelectorAll("a[href*='/product/']"))
  const names = []
  for (const c of cards) {
    const t = c.innerText || ""
    const m = t.match(/SKU:\s*([A-Z0-9-]+)/)
    // collect heading text near product cards
    const titleEl = c.querySelector("h3, [class*='CardTitle'], [class*='text-base']")
    if (titleEl) names.push(titleEl.textContent.trim())
  }
  // Fallback: scrape all CardTitles
  const allTitles = Array.from(document.querySelectorAll("[class*='CardTitle'], h3"))
    .map((el) => el.textContent.trim())
    .filter(Boolean)
  return Array.from(new Set(allTitles))
})

const allText = await page.evaluate(() => document.body.innerText)

console.log("API responses:")
for (const r of apiResponses) console.log(JSON.stringify(r))
console.log("\nVisible product titles:")
for (const n of visibleNames) console.log("  -", n)
console.log("\nExpected match check:")
for (const exp of EXPECTED) {
  const foundInApi = apiResponses.some((r) => r.products?.includes(exp))
  const foundOnPage = allText.includes(exp)
  console.log(`  ${exp}: api=${foundInApi} page=${foundOnPage}`)
}
console.log("\nErrors:", consoleErrors)

await browser.close()