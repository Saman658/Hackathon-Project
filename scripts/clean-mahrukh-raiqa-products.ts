import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const MAHRUKH_RAIQA_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

async function main() {
  // Verify the store exists
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('id', MAHRUKH_RAIQA_STORE_ID)
    .single()

  if (storeError || !store) {
    console.error('ABORT: Store not found:', storeError)
    return
  }
  console.log(`Found store: "${store.name}" (${store.slug}) owned by user ${store.user_id}`)

  // Fetch all products in this store
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, name, sku')
    .eq('store_id', MAHRUKH_RAIQA_STORE_ID)

  if (fetchError) {
    console.error('Error fetching products:', fetchError)
    return
  }

  console.log(`\nProducts to delete: ${products?.length || 0}`)
  products?.forEach(p => console.log(`  - ${p.name} (${p.sku}) id: ${p.id}`))

  if (!products || products.length === 0) {
    console.log('No products to delete.')
    return
  }

  // Delete all products
  const { error: deleteError } = await supabase
    .from('products')
    .delete()
    .eq('store_id', MAHRUKH_RAIQA_STORE_ID)

  if (deleteError) {
    console.error('Error deleting products:', deleteError)
    return
  }

  console.log(`\nDeleted ${products.length} products from "${store.name}".`)

  // Verify
  const { data: remaining } = await supabase
    .from('products')
    .select('id, name')
    .eq('store_id', MAHRUKH_RAIQA_STORE_ID)

  console.log(`Remaining products in store: ${remaining?.length || 0}`)
}

main().catch(console.error)
