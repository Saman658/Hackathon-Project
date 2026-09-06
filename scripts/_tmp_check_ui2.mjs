import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

await page.on('response', async (resp) => {
  const url = resp.url()
  if (url.includes('/api/store')) {
    let body = ''
    try { body = await resp.text() } catch { body = '<unreadable>' }
    try {
      const j = JSON.parse(body)
      console.log('[NETWORK]', url, '->', JSON.stringify({ storeName: j.store?.name, storeSlug: j.store?.slug, storeId: j.store?.id, count: j.products?.length, names: j.products?.map((p) => `${p.name} (${p.sku})`) }))
    } catch {
      console.log('[NETWORK]', url, '-> non-json', body.slice(0, 200))
    }
  }
})

async function check(url) {
  console.log(`\n========== ${url} ==========`)
  const resp = await page.goto(url, { waitUntil: 'networkidle' })
  console.log('HTTP status:', resp?.status())
  await page.waitForTimeout(3000)

  const navbarName = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('nav a, a'))
    const first = els.find((e) => e.textContent && e.textContent.trim().length > 0 && e.getAttribute('href') && e.getAttribute('href').startsWith('/store/'))
    return first ? first.textContent.trim() : null
  })
  console.log('Navbar store name:', navbarName)

  const titles = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="CardTitle"], [class*="card-title"], h2, h3'))
      .map((e) => (e.textContent || '').trim())
      .filter(Boolean)
  )
  console.log('CARD TITLES:', JSON.stringify([...new Set(titles)]))
}

await check('http://localhost:3000/store/mahrukh-store')

await browser.close()
console.log('DONE')
