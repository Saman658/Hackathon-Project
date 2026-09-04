import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import sharp from 'sharp'
import { createHash } from 'node:crypto'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || readFileSync('.env.local','utf8').match(/SUPABASE_SERVICE_ROLE_KEY=(\S+)/)?.[1]
const supabase = createClient(url, key)

function sha256(buf){const h=createHash('sha256');h.update(buf);return h.digest('hex')}

const targets = [
  'https://shoprex.com/images/srproducts/large/digital-printed-lawn-shirt-with-trouser-2-pec-suite-unstitched-drl-1388_46536.jpg',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80',
]

;(async () => {
  // Compare the local mahrukh-lawn.jpg with the shoprex image
  const localPath = 'public/products/mahrukh-lawn.jpg'
  if (existsSync(localPath)) {
    const localMeta = await sharp(localPath).metadata()
    const localBuf = readFileSync(localPath)
    console.log(`LOCAL mahrukh-lawn.jpg: ${localMeta.width}x${localMeta.height} ${localMeta.format} hash=${sha256(localBuf).slice(0,12)} size=${localBuf.length}`)
  }
  for (const t of targets) {
    try {
      const res = await fetch(t)
      const buf = Buffer.from(await res.arrayBuffer())
      const meta = await sharp(buf).metadata()
      console.log(`FETCH ${t.slice(0,70)}: status=${res.status} ${meta.width}x${meta.height} ${meta.format} hash=${sha256(buf).slice(0,12)} size=${buf.length}`)
    } catch(e){ console.log('ERR', t.slice(0,60), e.message) }
  }
})()
