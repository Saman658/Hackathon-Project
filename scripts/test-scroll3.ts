import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  
  await page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' })
  
  // Try scrolling without clicking
  await page.mouse.move(640, 360)
  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(500)
  
  const scrollYAfterWheel = await page.evaluate(() => window.scrollY)
  console.log('Scroll Y after wheel (no click):', scrollYAfterWheel)
  
  // Reset scroll
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(200)
  
  // Click first, then scroll
  await page.click('body')
  await page.waitForTimeout(200)
  await page.mouse.wheel(0, 200)
  await page.waitForTimeout(500)
  
  const scrollYAfterClickWheel = await page.evaluate(() => window.scrollY)
  console.log('Scroll Y after click + wheel:', scrollYAfterClickWheel)
  
  // Check for any fixed overlays
  const fixedElements = await page.evaluate(() => {
    const results = []
    const elements = document.querySelectorAll('*')
    for (const el of elements) {
      const style = getComputedStyle(el)
      if ((style.position === 'fixed' || style.position === 'absolute') && style.pointerEvents !== 'none') {
        const rect = el.getBoundingClientRect()
        if (rect.top >= -10 && rect.left >= -10 && rect.width > 0 && rect.height > 0) {
          results.push({
            tag: el.tagName,
            class: el.className,
            position: style.position,
            pointerEvents: style.pointerEvents,
            zIndex: style.zIndex,
            rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
          })
        }
      }
    }
    return results
  })
  console.log('Fixed/absolute elements:', JSON.stringify(fixedElements, null, 2))
  
  // Check body style
  const bodyStyle = await page.evaluate(() => {
    const s = getComputedStyle(document.body)
    return {
      overflow: s.overflow,
      overflowX: s.overflowX,
      overflowY: s.overflowY,
      pointerEvents: s.pointerEvents,
      height: s.height,
    }
  })
  console.log('Body style:', JSON.stringify(bodyStyle))
  
  // Check html style
  const htmlStyle = await page.evaluate(() => {
    const s = getComputedStyle(document.documentElement)
    return {
      overflow: s.overflow,
      height: s.height,
    }
  })
  console.log('HTML style:', JSON.stringify(htmlStyle))
  
  await browser.close()
}

main().catch(console.error)
