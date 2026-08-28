import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  // Get ALL products including Draft/Discontinued
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('\n=== ALL PRODUCTS (any status) ===')
  console.log(JSON.stringify(allProducts, null, 2))

  // Check for products without store_id
  const noStore = allProducts?.filter(p => !p.store_id) || []
  console.log(`\nProducts without store_id: ${noStore.length}`)

  // Check inactive products
  const inactive = allProducts?.filter(p => p.status !== 'Active') || []
  console.log(`Inactive products: ${inactive.length}`)
  inactive.forEach(p => console.log(`  - ${p.name} (${p.status})`))

  // Count per user
  const sehrishByUser = allProducts?.filter(p => p.user_id === SEHRISH_USER_ID) || []
  const mahrukhByUser = allProducts?.filter(p => p.user_id === MAHRUKH_USER_ID) || []
  console.log(`\nSehrish products total: ${sehrishByUser.length}`)
  console.log(`Mahrukh products total: ${mahrukhByUser.length}`)

  // Count per store
  const sehrishByStore = allProducts?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  const mahrukhByStore = allProducts?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []
  console.log(`\nSehrish Store products: ${sehrishByStore.length}`)
  console.log(`Mahrukh Store products: ${mahrukhByStore.length}`)

  // Check for orphaned products (user has no store or product store doesn't match user's store)
  const { data: stores } = await supabase.from('stores').select('id, user_id, name, slug')
  console.log('\n=== ALL STORES ===')
  console.log(JSON.stringify(stores, null, 2))

  // Check if any product's store belongs to a different user
  const storeOwners = new Map(stores?.map(s => [s.id, s.user_id]) || [])
  const mismatched = allProducts?.filter(p => {
    if (!p.store_id || !storeOwners.has(p.store_id)) return false
    return storeOwners.get(p.store_id) !== p.user_id
  }) || []
  console.log(`\nProducts where store owner != product owner: ${mismatched.length}`)
  mismatched.forEach(p => console.log(`  - ${p.name}: user=${p.user_id}, store=${p.store_id} (store owner=${storeOwners.get(p.store_id)})`))
}

main().catch(console.error)
