import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  console.log('=== VERIFYING STORE/USER ID MAPPING ===\n')

  // 1. Read all stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .order('created_at', { ascending: true })

  if (storesError) {
    console.error('Error fetching stores:', storesError)
    return
  }

  console.log('--- ALL STORES ---')
  console.log(JSON.stringify(stores, null, 2))

  // Build store -> owner map
  const storeOwnerMap = new Map<string, string>()
  stores?.forEach(s => storeOwnerMap.set(s.id, s.user_id))

  // 2. Read all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, business_name')

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  console.log('\n--- ALL PROFILES ---')
  console.log(JSON.stringify(profiles, null, 2))

  // 3. Read all products
  const { data: allProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, created_at')
    .order('created_at', { ascending: true })

  if (productsError) {
    console.error('Error fetching products:', productsError)
    return
  }

  console.log('\n--- ALL PRODUCTS ---')
  console.log(JSON.stringify(allProducts, null, 2))

  // 4. Check for cross-store contamination
  console.log('\n--- CROSS-STORE CONTAMINATION CHECK ---')

  const contaminated = allProducts?.filter(p => {
    if (!p.store_id) return false
    const actualStoreOwner = storeOwnerMap.get(p.store_id)
    if (actualStoreOwner === undefined) return false
    return actualStoreOwner !== p.user_id
  }) || []

  if (contaminated.length === 0) {
    console.log('No cross-store contamination found.')
  } else {
    console.log(`Found ${contaminated.length} products where store owner != product owner:`)
    contaminated.forEach(p => {
      const actualOwner = storeOwnerMap.get(p.store_id)
      console.log(`  - ${p.name} (id: ${p.id})`)
      console.log(`    product user_id: ${p.user_id}`)
      console.log(`    store_id: ${p.store_id}`)
      console.log(`    actual store owner: ${actualOwner}`)
    })
  }

  // 5. Products without store_id
  const noStore = allProducts?.filter(p => !p.store_id) || []
  console.log(`\nProducts without store_id: ${noStore.length}`)
  noStore.forEach(p => console.log(`  - ${p.name} (id: ${p.id})`))

  // 6. Summary: products per store
  console.log('\n--- PRODUCTS PER STORE ---')
  stores?.forEach(store => {
    const storeProducts = allProducts?.filter(p => p.store_id === store.id) || []
    const profile = profiles?.find(pr => pr.id === store.user_id)
    console.log(`Store "${store.name}" (slug: ${store.slug})`)
    console.log(`  id: ${store.id}`)
    console.log(`  owner user_id: ${store.user_id} (${profile?.name || 'unknown'})`)
    console.log(`  products: ${storeProducts.length}`)
    storeProducts.forEach(p => {
      const isContaminated = store.user_id !== p.user_id
      console.log(`    - ${p.name} (user: ${p.user_id} ${isContaminated ? 'WRONG OWNER' : ''})`)
    })
  })

  // 7. Products without a store
  const productsWithStore = allProducts?.filter(p => storeOwnerMap.has(p.store_id || '')) || []
  const productsWithoutStore = allProducts?.filter(p => !p.store_id || !storeOwnerMap.has(p.store_id || '')) || []
  console.log(`\nProducts with valid store: ${productsWithStore.length}`)
  console.log(`Products with invalid/missing store: ${productsWithoutStore.length}`)
  productsWithoutStore.forEach(p => console.log(`  - ${p.name} (store_id: ${p.store_id || 'null'})`))
}

main().catch(console.error)
