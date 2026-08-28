import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  await page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' })
  
  const productCount = await page.locator('.grid > div').count()
  console.log('Product cards count:', productCount)
  
  const productNames = await page.locator('.grid > div h3').allTextContents()
  console.log('Product names:', productNames)
  
  const htmlOverflow = await page.evaluate(() => getComputedStyle(document.documentElement).overflow)
  const bodyOverflow = await page.evaluate(() => getComputedStyle(document.body).overflow)
  const htmlHeight = await page.evaluate(() => getComputedStyle(document.documentElement).height)
  const bodyHeight = await page.evaluate(() => getComputedStyle(document.body).height)
  const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight)
  const viewportHeight = await page.evaluate(() => window.innerHeight)
  
  console.log('html overflow:', htmlOverflow)
  console.log('body overflow:', bodyOverflow)
  console.log('html height:', htmlHeight)
  console.log('body height:', bodyHeight)
  console.log('document scrollHeight:', documentHeight)
  console.log('viewport height:', viewportHeight)
  
  const hasInvisibleOverlay = await page.evaluate(() => {
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const style = getComputedStyle(el)
      if (style.position === 'fixed' || style.position === 'absolute') {
        const rect = el.getBoundingClientRect()
        if (rect.width >= window.innerWidth && rect.height >= window.innerHeight && parseInt(style.zIndex, 10) > 0) {
          return { tag: el.tagName, class: el.className, zIndex: style.zIndex, visible: rect.width > 0 && rect.height > 0 }
        }
      }
    }
    return null
  })
  console.log('Invisible overlay:', hasInvisibleOverlay)
  
  await browser.close()
}

main().catch(console.error)
