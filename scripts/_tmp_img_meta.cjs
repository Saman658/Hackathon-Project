const sharp = require('sharp');
const fs = require('fs');
const dir = 'public/products';
const files = fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|svg)$/i.test(f));
(async () => {
  for (const f of files) {
    try {
      if (f.endsWith('.svg')) continue;
      const meta = await sharp(`${dir}/${f}`).metadata();
      const st = fs.statSync(`${dir}/${f}`);
      console.log(`${f} | ${meta.width}x${meta.height} | ${meta.format} | ${Math.round(st.size/1024)}KB`);
    } catch (e) {
      console.log(`${f} | ERROR: ${e.message}`);
    }
  }
})();
