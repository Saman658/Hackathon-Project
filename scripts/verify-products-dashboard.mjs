import { chromium } from "playwright"

const EXPECTED_MAHRUKH = [
  "Hamza Ismail 3PC Printed Lawn Suit",
  "Chevron 3-Piece Ladies Suit",
  "Digital Printed 3-Piece Suit",
]
const FORBIDDEN = ["Shoes", "Baby Girl Shirt", "Suit Piece", "Headphone"]

const browser = await chromium.launch()
const ctx = await browser.newContext()
const page = await ctx.newPage()

const apiCalls = []
page.on("response", async (r) => {
  const u = r.url()
  if (u.includes("/rest/v1/products") || u.includes("/api/store")) {
    let body = ""
    try {
      body = await r.text()
    } catch {}
    apiCalls.push({ url: u, status: r.status(), body: body.slice(0, 600) })
  }
})

const errors = []
page.on("pageerror", (e) => errors.push("pageerror: " + e.message))
page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()) })

// Log in
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" })
await page.fill('input[type="email"]', "mahrukhariqa@gmail.com")
await page.fill('input[type="password"]', "testpassword")
await Promise.all([
  page.waitForURL(/\/dashboard/, { timeout: 30000 }),
  page.click('button[type="submit"]'),
])

// Hard navigate to products dashboard
await page.goto("http://localhost:3000/dashboard/products", { waitUntil: "networkidle" })
await page.waitForSelector("table", { timeout: 15000 }).catch(() => {})
await page.waitForTimeout(2000)

const dashboardText = await page.evaluate(() => document.body.innerText)
const productNames = await page.evaluate(() => {
  return Array.from(document.querySelectorAll("table tbody tr td span.font-medium")).map(e => e.textContent.trim()).filter(Boolean)
})

console.log("PRODUCTS SHOWN ON DASHBOARD:")
for (const n of productNames) console.log("  -", n)

console.log("\nMATCH CHECK:")
for (const exp of EXPECTED_MAHRUKH) {
  const found = productNames.includes(exp)
  console.log(`  EXPECT ${exp}: ${found ? "OK" : "MISSING"}`)
}
for (const bad of FORBIDDEN) {
  const found = productNames.includes(bad)
  console.log(`  FORBIDDEN ${bad}: ${found ? "LEAKED (BAD)" : "OK (not shown)"}`)
}

console.log("\nAPI CALLS:")
for (const c of apiCalls) console.log(c.url, c.status, c.body.slice(0, 200))

console.log("\nERRORS:")
for (const e of errors) console.log("  ", e)

await browser.close()