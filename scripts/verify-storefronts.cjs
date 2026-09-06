const http = require('http');
const fs = require('fs');

function fetch(path, outFile) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 3000, path, method: 'GET', headers: { 'Connection': 'close' } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (outFile) fs.writeFileSync(outFile, data);
          resolve({ status: res.statusCode, body: data });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

(async () => {
  const targets = [
    { slug: 'mahrukh-store', file: 'storefront-mahrukh.html' },
    { slug: 's', file: 'storefront-sehrish.html' },
  ];
  for (const t of targets) {
    const r = await fetch(`/store/${t.slug}`, t.file);
    // Look for product names that should appear in the rendered HTML
    const html = r.body;
    const markers = {
      'mahrukh-store': [
        'Hamza Ismail 3PC Printed Lawn Suit',
        'Chevron 3-Piece Ladies Suit',
        'Digital Printed 3-Piece Suit',
        'Shoes', 'Baby Girl Shirt', 'Suit Piece', 'Headphone',
        'Classic Ladies Watch', 'Add-on Pack',
      ],
      s: [
        'Shoes', 'Baby Girl Shirt', 'Suit Piece', 'Headphone',
        'Classic Ladies Watch', 'Add-on Pack',
        'Hamza Ismail 3PC Printed Lawn Suit',
        'Chevron 3-Piece Ladies Suit',
        'Digital Printed 3-Piece Suit',
      ],
    }[t.slug];
    console.log(`\n=== /store/${t.slug} (HTTP ${r.status}, ${html.length} bytes) ===`);
    for (const m of markers) {
      const found = html.includes(m);
      console.log(`  ${found ? '✓' : '✗'} "${m}"`);
    }
  }
})();
