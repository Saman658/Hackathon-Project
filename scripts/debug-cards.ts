import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Test generic product detail page
  await page.goto('http://localhost:3000/store/product/79c8759e-6d5f-4d0a-b214-ff27acd71c13', { waitUntil: 'domcontentloaded', timeout: 60000 })
  
  // Wait a bit for client-side fetch
  await page.waitForTimeout(3000)
  
  const bodyText = await page.textContent('body')
  console.log('Generic product detail:', bodyText?.substring(0, 500))
  
  await browser.close()
  console.log('Done')
}

main().catch(err => { console.error('Error:', err); process.exit(1) })
