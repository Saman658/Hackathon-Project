import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  const { data: all, error } = await supabase
    .from('products')
    .select('id, name, sku, user_id, store_id, status, image_url')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('QUERY ERROR:', error)
    return
  }

  console.log('=== ALL PRODUCTS (count=' + (all?.length || 0) + ') ===')
  all?.forEach((p, i) => {
    console.log(`${i + 1}. "${p.name}" | sku:${p.sku} | store:${p.store_id} | user:${p.user_id} | status:${p.status} | cat:${p.category || ''} | img:${p.image_url}`)
  })

  const sehrish = all?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  const mahrukh = all?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []

  console.log('\n=== SEHRISH STORE (' + sehrish.length + ') ===')
  sehrish.forEach(p => console.log(`  - "${p.name}" | sku:${p.sku} | status:${p.status} | user:${p.user_id}`))
  console.log('\n=== MAHRUKH STORE (' + mahrukh.length + ') ===')
  mahrukh.forEach(p => console.log(`  - "${p.name}" | sku:${p.sku} | status:${p.status} | user:${p.user_id}`))
}

main().catch(console.error)
