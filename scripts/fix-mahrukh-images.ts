import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const MAHRUKH_ARIQA_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

const URL_BEYONDDETAIL = 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100'
const URL_AFIAY = 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840'
const URL_LIMELIGHT = 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445'
const URL_MIANDAD = 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533'

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url, created_at')
    .eq('store_id', MAHRUKH_ARIQA_STORE_ID)
    .order('created_at', { ascending: true })

  if (error || !products) {
    console.error('Error:', error)
    return
  }

  console.log(`Found ${products.length} products in Mahrukh Ariqa Store`)
  for (const p of products) {
    console.log(`  [${p.sku}] ${p.name}`)
  }

  if (products.length !== 4) {
    console.error(`Expected 4 products, found ${products.length}. Aborting.`)
    return
  }

  const orderedUrls = [URL_BEYONDDETAIL, URL_AFIAY, URL_LIMELIGHT, URL_MIANDAD]

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const newUrl = orderedUrls[i]

    const { data, error: updErr } = await supabase
      .from('products')
      .update({ image_url: newUrl })
      .eq('id', p.id)
      .select('id, name, sku, image_url')
      .single()

    if (updErr) {
      console.error(`Error updating ${p.name}:`, updErr.message)
    } else {
      console.log(`Updated [${data.sku}] ${data.name}`)
      console.log(`  -> ${data.image_url}`)
    }
  }

  console.log('\n=== Verification ===')
  const { data: final } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url')
    .eq('store_id', MAHRUKH_ARIQA_STORE_ID)
    .order('created_at', { ascending: true })

  for (const p of final || []) {
    console.log(`  - ${p.name} (${p.sku}) | $${p.price} | stock ${p.stock} | ${p.status}`)
    console.log(`    image: ${p.image_url}`)
  }

  const expected = orderedUrls
  const allMatch = expected.every((u) => (final || []).some((p) => p.image_url === u))
  console.log(`\n${allMatch ? 'OK' : 'MISSING'}: All 4 URLs are present in DB.`)
}

main().catch(console.error)