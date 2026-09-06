import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

// Mahrukh Ariqa's OWN store. (store_id d75917db-* belongs to the Sehrish
// store and must NOT be touched — only this Mahrukh store is.
const MAHRUKH_ARIQA_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

const URL_BY_SKU: Record<string, string> = {
  'MAHRUKH-BEYOND-001': 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100',
  'MAHRUKH-LAWN-001': 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840',
  'MAHRUKH-HAMZA-001': 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445',
  'MAHRUKH-CHEVRON-001': 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533',
}

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

  const desired = Object.values(URL_BY_SKU)

  for (const p of products) {
    const newUrl = URL_BY_SKU[p.sku || '']
    if (!newUrl) {
      console.log(`SKIP [${p.sku}] ${p.name}: no URL mapping for this SKU`)
      continue
    }
    if (p.image_url === newUrl) {
      console.log(`OK   [${p.sku}] ${p.name} already uses correct image`)
      continue
    }
    const { data, error: updErr } = await supabase
      .from('products')
      .update({ image_url: newUrl })
      .eq('id', p.id)
      .eq('store_id', MAHRUKH_ARIQA_STORE_ID)
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

  const allMatch = desired.every((u) => (final || []).some((p) => p.image_url === u))
  console.log(`\n${allMatch ? 'OK' : 'MISSING'}: All 4 URLs are present in DB.`)
}

main().catch(console.error)
