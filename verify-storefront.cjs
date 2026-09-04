const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      resourceType: request.resourceType(),
      method: request.method()
    });
  });
  
  await page.goto('http://127.0.0.1:3000/store/mahrukh-store', { waitUntil: 'networkidle', timeout: 30000 });
  
  const scriptRequests = requests.filter(r => r.resourceType === 'script');
  console.log('Total script requests:', scriptRequests.length);
  scriptRequests.forEach(r => console.log(r.url));
  
  await browser.close();
})().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
