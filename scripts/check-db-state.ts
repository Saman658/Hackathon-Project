import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  // Get all products
  const { data: allProducts, error } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return
  }

  console.log('\n=== ALL PRODUCTS IN DATABASE ===')
  console.log(JSON.stringify(allProducts, null, 2))

  // Count per user
  const sehrishByUser = allProducts?.filter(p => p.user_id === SEHRISH_USER_ID) || []
  const mahrukhByUser = allProducts?.filter(p => p.user_id === MAHRUKH_USER_ID) || []

  console.log(`\nSehrish products (by user_id): ${sehrishByUser.length}`)
  console.log(`Mahrukh products (by user_id): ${mahrukhByUser.length}`)

  // Count per store
  const sehrishByStore = allProducts?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  const mahrukhByStore = allProducts?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []

  console.log(`\nSehrish Store products (by store_id): ${sehrishByStore.length}`)
  console.log(`Mahrukh Store products (by store_id): ${mahrukhByStore.length}`)

  // Check for cross-contamination
  const mahrukhInSehrishStore = sehrishByStore.filter(p => p.user_id === MAHRUKH_USER_ID)
  const sehrishInMahrukhStore = mahrukhByStore.filter(p => p.user_id === SEHRISH_USER_ID)

  console.log(`\nMahrukh products in Sehrish store: ${mahrukhInSehrishStore.length}`)
  console.log(`Sehrish products in Mahrukh store: ${sehrishInMahrukhStore.length}`)

  // Get stores
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, user_id, slug')

  console.log('\n=== STORES ===')
  console.log(JSON.stringify(stores, null, 2))
}

main().catch(console.error)
