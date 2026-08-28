import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  
  await page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' })
  
  const gridDivs = await page.locator('.grid > div').all()
  console.log('Total .grid > div elements:', gridDivs.length)
  
  for (let i = 0; i < gridDivs.length; i++) {
    const html = await gridDivs[i].innerHTML()
    const text = await gridDivs[i].innerText()
    console.log(`\n--- Div ${i} ---`)
    console.log('Text:', text.substring(0, 100))
    console.log('HTML (first 200 chars):', html.substring(0, 200))
  }
  
  await browser.close()
}

main().catch(console.error)
