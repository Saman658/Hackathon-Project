import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'

async function main() {
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

  const targets = [
    {
      id: '1b0ddcd2-f529-4b35-af40-ebae5062fe33',
      name: 'Ladies Suit',
      image_url: '/products/mens-suit-piece.jpg',
    },
    {
      id: 'd05f2705-bff3-4545-9833-a9c492ff9530',
      name: 'Ladies Shirt',
      image_url: '/products/mens-suit-piece.jpg',
    },
  ]

  for (const t of targets) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: t.image_url })
      .eq('id', t.id)
      .eq('store_id', MAHRUKH_STORE_ID)
      .select('id, name, image_url')
      .single()

    if (error) {
      console.error(`Error updating ${t.name}:`, error.message)
    } else {
      console.log(`Updated ${data.name}: ${data.image_url}`)
    }
  }

  console.log('\n=== Verification ===')
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, image_url, price, stock, status')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  products?.forEach(p => {
    console.log(`  - ${p.name} (${p.sku}) | $${p.price} | stock ${p.stock} | ${p.status}`)
    console.log(`    image: ${p.image_url}`)
  })
}

main().catch(console.error)