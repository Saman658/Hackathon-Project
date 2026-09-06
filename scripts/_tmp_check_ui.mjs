import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

async function check(url) {
  console.log(`\n========== ${url} ==========`)
  const resp = await page.goto(url, { waitUntil: 'networkidle' })
  console.log('HTTP status:', resp?.status())
  await page.waitForTimeout(2500)

  const titles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="CardTitle"], [class*="card-title"], h2, h3'))
      .map((e) => (e.textContent || '').trim())
      .filter(Boolean)
  )
  const skus = await page.evaluate(() =>
    Array.from(document.querySelectorAll('*'))
      .map((e) => (e.textContent || '').trim())
      .filter((t) => /SKU:/.test(t))
  )
  const noProducts = await page.locator('text=No products available yet').count()
  console.log('No products message:', noProducts)
  console.log('CARD TITLES:', JSON.stringify([...new Set(titles)]))
  console.log('SKU LINES:', JSON.stringify([...new Set(skus)]))
}

await check('http://localhost:3000/store/mahrukh-store')
await check('http://localhost:3000/store/s')

await browser.close()
