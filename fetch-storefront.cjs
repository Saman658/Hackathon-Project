const http = require('http');
const fs = require('fs');

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/store/mahrukh-store',
  method: 'GET',
  headers: {
    'Host': '127.0.0.1:3000',
    'Connection': 'close'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('storefront-raw.html', data);
    console.log('Downloaded ' + data.length + ' bytes');
    
    const matches = data.match(/https:\/\/[^\s"<>]+/g) || [];
    const productImages = matches.filter(u => 
      u.includes('afiay') || 
      u.includes('unsplash') || 
      u.includes('shoprex') || 
      u.includes('dilkash') || 
      u.includes('cdn.shopify.com') ||
      u.includes('limelight') ||
      u.includes('beyonddetail') ||
      u.includes('yasrabfab')
    );
    console.log('Product image URLs:');
    productImages.forEach(u => console.log(u));
  });
});

req.on('error', (e) => {
  console.error('Request error:', e.message);
});

req.setTimeout(30000, () => {
  console.error('Request timeout');
  req.destroy();
});

req.end();
