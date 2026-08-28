import { chromium } from 'playwright'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  
  await page.goto('http://localhost:3000/store/mahrukh-store', { waitUntil: 'networkidle' })
  
  // Get all event listeners by intercepting addEventListener
  const eventListeners = await page.evaluate(() => {
    const listeners: any[] = []
    const originalAddEventListener = EventTarget.prototype.addEventListener
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener
    
    EventTarget.prototype.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      listeners.push({ target: this === window ? 'window' : this === document ? 'document' : this === document.documentElement ? 'html' : this === document.body ? 'body' : 'other', type, options })
      return originalAddEventListener.call(this, type, listener, options)
    }
    
    // Trigger a re-render to capture existing listeners... 
    // Actually, we can't capture existing listeners this way. Let's just check for full-screen overlays instead.
    
    return { captured: listeners.length }
  })
  
  console.log('Event listeners captured via monkey-patch:', eventListeners)
  
  await browser.close()
}

main().catch(console.error)
