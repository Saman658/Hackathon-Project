import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

const URL_BY_SKU = {
  'MAHRUKH-BEYOND-001': 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100',
  'MAHRUKH-LAWN-001': 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840',
  'MAHRUKH-HAMZA-001': 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445',
  'MAHRUKH-CHEVRON-001': 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533',
}

async function main() {
  console.log('=== Setting Mahrukh storefront images (idempotent, by SKU) ===')
  for (const [sku, image_url] of Object.entries(URL_BY_SKU)) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url })
      .eq('sku', sku)
      .eq('store_id', MAHRUKH_STORE_ID)
      .eq('user_id', MAHRUKH_USER_ID)
      .select('id, name, sku, image_url')
      .maybeSingle()

    if (error) {
      console.error(`Error updating ${sku}:`, error.message)
    } else if (!data) {
      console.log(`SKIP ${sku}: no matching product in Mahrukh store`)
    } else {
      console.log(`Updated [${data.sku}] ${data.name} -> ${data.image_url}`)
    }
  }

  console.log('\n=== Verification ===')
  const { data: final, error } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error verifying:', error.message)
    return
  }

  console.log(`Mahrukh Store (${final?.length || 0} products):`)
  for (const p of final || []) {
    console.log(`  - ${p.name} [sku=${p.sku}] price=$${p.price} stock=${p.stock} status=${p.status}`)
    console.log(`    image: ${p.image_url}`)
  }

  const desired = Object.values(URL_BY_SKU)
  const allMatch = desired.every((u) => (final || []).some((p) => p.image_url === u))
  console.log(`\n${allMatch ? 'OK' : 'MISSING'}: All 4 URLs are present in DB.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
