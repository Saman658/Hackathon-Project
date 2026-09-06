import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  const apiResponses: Record<string, any> = {}
  page.on('response', async (response) => {
    const url = response.url()
    if (url.includes('/api/store/')) {
      try {
        const json = await response.json()
        apiResponses[url] = {
          status: response.status(),
          body: json
        }
      } catch (e) {
        apiResponses[url] = {
          status: response.status(),
          error: 'Could not parse JSON'
        }
      }
    }
  })

  // Test 1: Mahrukh Store
  console.log('=== Opening /store/mahrukh-store ===')
  await page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  
  console.log('\n--- API Requests for Mahrukh ---')
  for (const [url, data] of Object.entries(apiResponses)) {
    console.log(`URL: ${url}`)
    console.log(`Status: ${data.status}`)
    if (data.body) {
      console.log(`Store ID: ${data.body.store?.id}`)
      console.log(`Store Name: ${data.body.store?.name}`)
      console.log(`Product Count: ${data.body.products?.length || 0}`)
      console.log('Products:')
      for (const p of data.body.products || []) {
        console.log(`  - ${p.name} (${p.sku}) [storeId: ${p.storeId}]`)
      }
    }
  }

  const mahrukhRenderedNames = await page.locator('text=/All-Over Print|Hamza Ismail|Chevron|Digital Printed|Add-on Pack|Classic Ladies Watch|Headphone|Suit Piece|Baby Girl Shirt|Shoes/').allTextContents()
  console.log('\n--- Rendered Product Names (Mahrukh) ---')
  for (const name of mahrukhRenderedNames) {
    console.log(`  ${name}`)
  }

  // Clear captured responses for next test
  Object.keys(apiResponses).forEach(key => delete apiResponses[key])

  // Test 2: Sehrish Store
  console.log('\n=== Opening /store/sehrish-tanzeel-store ===')
  await page.goto('http://localhost:3000/store/sehrish-tanzeel-store', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  
  console.log('\n--- API Requests for Sehrish ---')
  for (const [url, data] of Object.entries(apiResponses)) {
    console.log(`URL: ${url}`)
    console.log(`Status: ${data.status}`)
    if (data.body) {
      console.log(`Store ID: ${data.body.store?.id}`)
      console.log(`Store Name: ${data.body.store?.name}`)
      console.log(`Product Count: ${data.body.products?.length || 0}`)
      console.log('Products:')
      for (const p of data.body.products || []) {
        console.log(`  - ${p.name} (${p.sku}) [storeId: ${p.storeId}]`)
      }
    }
  }

  const sehrishRenderedNames = await page.locator('text=/All-Over Print|Hamza Ismail|Chevron|Digital Printed|Add-on Pack|Classic Ladies Watch|Headphone|Suit Piece|Baby Girl Shirt|Shoes/').allTextContents()
  console.log('\n--- Rendered Product Names (Sehrish) ---')
  for (const name of sehrishRenderedNames) {
    console.log(`  ${name}`)
  }

  // Check localStorage/cookies
  console.log('\n--- LocalStorage Keys ---')
  const localStorageKeys = await page.evaluate(() => {
    const keys: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (key) keys.push(key)
    }
    return keys
  })
  console.log(localStorageKeys)

  // Check cookies
  console.log('\n--- Cookies ---')
  const cookies = await context.cookies()
  for (const cookie of cookies) {
    if (cookie.name.includes('store') || cookie.name.includes('supabase') || cookie.name.includes('session')) {
      console.log(`${cookie.name}: ${cookie.value?.substring(0, 50)}...`)
    }
  }

  await browser.close()
}

main().catch(console.error)
