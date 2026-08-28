const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/store/sehrish-tanzeel-store',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // Find product card sections
    const cardMatches = data.match(/<div[^>]*class="[^"]*Card[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g);
    if (cardMatches) {
      console.log('Found', cardMatches.length, 'Card elements');
      // Show first card
      const firstCard = cardMatches[0];
      console.log('\n=== First Card ===');
      // Extract text content
      const text = firstCard.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(text.substring(0, 1000));
    } else {
      console.log('No Card elements found');
    }
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
});

req.end();
