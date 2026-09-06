import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
const page = await context.newPage()

await page.on('response', async (resp) => {
  const url = resp.url()
  if (url.includes('/api/store')) {
    let body = ''
    try { body = await resp.text() } catch { body = '<unreadable>' }
    try {
      const j = JSON.parse(body)
      console.log('[NETWORK]', url, '-> count:', j.products?.length, 'names:', JSON.stringify(j.products?.map((p) => `${p.name} (${p.sku})`)))
    } catch {
      console.log('[NETWORK]', url, '-> non-json', body.slice(0, 200))
    }
  }
})

async function titles() {
  await page.waitForTimeout(2000)
  return await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="CardTitle"], [class*="card-title"], h2, h3'))
      .map((e) => (e.textContent || '').trim())
      .filter(Boolean)
  )
}

// Step 1: load Sehrish store (slug s) FIRST
console.log('--- navigate to /store/s (Sehrish) ---')
await page.goto('http://localhost:3000/store/s', { waitUntil: 'networkidle' })
console.log('Sehrish rendered titles:', JSON.stringify([...new Set(await titles())]))

// Step 2: SPA-navigate to Mahrukh store (slug mahrukh-store) via link click / goto
console.log('--- navigate to /store/mahrukh-store (Mahrukh) via SPA ---')
await Promise.all([
  page.waitForResponse((r) => r.url().includes('/api/store/mahrukh-store') && r.status() === 200),
  page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' }),
])
console.log('Mahrukh rendered titles:', JSON.stringify([...new Set(await titles())]))

await browser.close()
console.log('DONE')
