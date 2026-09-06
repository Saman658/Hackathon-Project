const http = require('http');

function fetch(path) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { hostname: '127.0.0.1', port: 3000, path, method: 'GET', headers: { 'Connection': 'close' } },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

(async () => {
  for (const slug of ['mahrukh-store', 's', 'm']) {
    const r = await fetch(`/api/store/${slug}`);
    let body;
    try { body = JSON.parse(r.data); } catch { body = r.data.slice(0, 300); }
    console.log(`\n=== /api/store/${slug} (status ${r.status}) ===`);
    if (body.error) {
      console.log('error:', body.error);
      continue;
    }
    console.log('Store:', body.store?.name, '(slug=' + body.store?.slug + ', id=' + body.store?.id + ')');
    console.log(`Products (${body.products?.length}):`);
    for (const p of body.products || []) console.log('  -', p.sku, '|', p.name);
  }
})();
