const http = require('http');

function fetch(path, cookie) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1', port: 3000, path, method: 'GET',
        headers: { 'Connection': 'close', ...(cookie ? { Cookie: cookie } : {}) },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
      }
    );
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('timeout')); });
    req.end();
  });
}

(async () => {
  const r = await fetch('/api/store', '');
  console.log('Status:', r.status);
  console.log('Set-Cookie:', r.headers['set-cookie']);
  let body;
  try { body = JSON.parse(r.data); } catch { body = r.data.slice(0, 300); }
  console.log('Body:', JSON.stringify(body, null, 2));
})();
