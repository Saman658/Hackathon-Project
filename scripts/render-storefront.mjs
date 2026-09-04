import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

async function inspect(url) {
  console.log(`\n========== ${url} ==========`)
  const resp = await page.goto(url, { waitUntil: 'networkidle' })
  console.log('status', resp?.status())
  await page.waitForTimeout(1500)

  const buyNowCount = await page.locator('text=Buy Now').count()
  const outOfStockCount = await page.locator('text=Out of Stock').count()
  const noProducts = await page.locator('text=No products available yet').count()

  const categoryLinks = await page.$$eval('a[href*="?category="]', (els) =>
    els.map((e) => ({ href: e.getAttribute('href'), name: e.textContent?.trim() }))
  )

  // Product card titles: h2/h3 inside cards, plus all short text
  const productTitles = await page.evaluate(() => {
    const out = []
    for (const el of document.querySelectorAll('h2, h3')) {
      const t = (el.textContent || '').trim()
      if (t) out.push(t)
    }
    return out
  })

  const allText = await page.evaluate(() =>
    Array.from(document.querySelectorAll('body'))
      .map((e) => e.innerText || '')
      .join('\n')
  )

  console.log('Buy Now count:', buyNowCount)
  console.log('Out of Stock count:', outOfStockCount)
  console.log('No products message:', noProducts)
  console.log('category links:', JSON.stringify(categoryLinks))
  console.log('heading text:', JSON.stringify(productTitles))
  console.log('--- body text (filtered) ---')
  for (const line of allText.split('\n')) {
    const t = line.trim()
    if (t.length > 0 && t.length < 80) console.log('  ', t)
  }
}

await inspect('http://localhost:3000/store/sehrish-tanzeel-store')
await inspect('http://localhost:3000/store/mahrukh-store')

await browser.close()
