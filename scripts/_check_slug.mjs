import { chromium } from "playwright"
const browser = await chromium.launch()
const page = await browser.newPage()
page.on("response", async (r) => {
  const u = r.url()
  if (u.includes("/api/store")) {
    let body = ""
    try { body = await r.text() } catch {}
    console.log("API", r.status(), u, body.slice(0, 200))
  }
})
await page.goto("http://localhost:3000/store/mahrukh-store", { waitUntil: "networkidle" })
const slug = await page.evaluate(() => document.body.innerText.match(/mahrukh[\w-]*/i)?.[0])
console.log("slug-in-body:", slug)
await browser.close()