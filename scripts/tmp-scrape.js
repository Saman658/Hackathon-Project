const https = require('https');
const url = 'https://pixabay.com/photos/woman-pakistani-suit-dress-7702899/';
https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const imgs = data.match(/https?:\/\/[^"'<>\\s]+\.(jpg|jpeg|png|webp)/gi) || [];
    const unique = [...new Set(imgs)].filter(u => u.includes('pixabay') && u.includes('woman'));
    console.log(unique.slice(0, 10).join('\n'));
  });
}).on('error', e => console.log('ERR:', e.message));
