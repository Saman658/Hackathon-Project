const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/store/mahrukh-store',
  method: 'GET',
  headers: { 'Host': '127.0.0.1:3000', 'Connection': 'close' },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log('Store:', json.store?.name);
      console.log('Products count:', json.products?.length);
      for (const p of json.products || []) {
        console.log('---');
        console.log('  name :', p.name);
        console.log('  sku  :', p.sku);
        console.log('  image:', p.image);
      }
    } catch (e) {
      console.log('Raw:', data.slice(0, 500));
    }
  });
});
req.on('error', (e) => console.error('Error:', e.message));
req.setTimeout(30000, () => { console.error('Timeout'); req.destroy(); });
req.end();