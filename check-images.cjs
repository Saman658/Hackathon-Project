const fs = require('fs');
const html = fs.readFileSync('storefront.html', 'utf8');
const matches = html.match(/https:\/\/[^\s"<>]+/g) || [];
const productImages = matches.filter(u => 
  u.includes('afiay') || 
  u.includes('unsplash') || 
  u.includes('shoprex') || 
  u.includes('dilkash') || 
  u.includes('limelight') || 
  u.includes('beyonddetail') || 
  u.includes('yasrabfab') || 
  u.includes('shopify.com/s/files')
);
console.log('Product image URLs in rendered HTML:');
productImages.forEach(u => console.log(u));
