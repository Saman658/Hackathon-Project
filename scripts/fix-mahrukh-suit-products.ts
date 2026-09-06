import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'

const URL_BY_SKU: Record<string, string> = {
  'MAHRUKH-HAMZA-001': 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445',
  'MAHRUKH-CHEVRON-001': 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533',
}

async function main() {
  // Verify the store belongs to Mahrukh before touching anything.
  const { data: storeCheck, error: storeCheckErr } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('id', MAHRUKH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)
    .single()

  if (storeCheckErr || !storeCheck) {
    console.error(`ABORT: store ${MAHRUKH_STORE_ID} is not owned by ${MAHRUKH_USER_ID}`)
    return
  }
  console.log(`Verified store: ${storeCheck.name} (${storeCheck.slug})`)

  for (const [sku, image_url] of Object.entries(URL_BY_SKU)) {
    const { data: current, error: findErr } = await supabase
      .from('products')
      .select('id, name, image_url')
      .eq('sku', sku)
      .eq('store_id', MAHRUKH_STORE_ID)
      .maybeSingle()

    if (findErr) {
      console.error(`Error looking up ${sku}:`, findErr.message)
      continue
    }
    if (!current) {
      console.log(`SKIP ${sku}: product not found in Mahrukh store`)
      continue
    }
    if (current.image_url === image_url) {
      console.log(`OK   [${sku}] ${current.name} already uses correct image`)
      continue
    }

    const { data, error } = await supabase
      .from('products')
      .update({ image_url })
      .eq('id', current.id)
      .eq('store_id', MAHRUKH_STORE_ID)
      .select('id, name, image_url')
      .single()

    if (error) {
      console.error(`Error updating ${current.name} (${sku}):`, error.message)
    } else {
      console.log(`Updated ${data.name} (${sku}): ${data.image_url}`)
    }
  }

  console.log('\n=== Verification ===')
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, image_url, price, stock, status')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  products?.forEach((p) => {
    console.log(`  - ${p.name} (${p.sku}) | $${p.price} | stock ${p.stock} | ${p.status}`)
    console.log(`    image: ${p.image_url}`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
