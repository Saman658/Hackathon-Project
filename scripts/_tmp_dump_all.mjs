import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  console.log('=== ALL STORES ===')
  const { data: stores } = await supabase
    .from('stores')
    .select('id, user_id, name, slug, description, hero_title, created_at, updated_at')
    .order('created_at', { ascending: true })
  console.log(JSON.stringify(stores, null, 2))

  console.log('\n=== ALL PRODUCTS (active) ===')
  const { data: products } = await supabase
    .from('products')
    .select('id, user_id, store_id, name, sku, price, stock, status, image_url, created_at')
    .order('created_at', { ascending: false })
  console.log('total products:', products?.length)
  console.log(JSON.stringify(products, null, 2))

  console.log('\n=== PRODUCTS PER STORE ===')
  for (const s of stores || []) {
    const { data: ps } = await supabase.from('products').select('id, name, sku, status').eq('store_id', s.id)
    console.log(`\nStore: ${s.name} (slug=${s.slug}, id=${s.id})`)
    console.log(`  products: ${ps?.length || 0}`)
    ps?.forEach((p) => console.log(`    - ${p.name} | ${p.sku} | ${p.status}`))
  }
}
main().catch(console.error)
