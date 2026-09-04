import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  console.log('=== CHECKING DATABASE ===\n')

  // Check stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .order('created_at', { ascending: true })

  console.log('Stores:')
  if (storesError) {
    console.error('Error fetching stores:', storesError)
  } else {
    stores?.forEach(s => console.log(`  - ${s.name} (${s.slug}) user: ${s.user_id} id: ${s.id}`))
  }

  // Check all products
  const { data: allProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, created_at')
    .order('created_at', { ascending: true })

  console.log('\nAll products in database:')
  if (productsError) {
    console.error('Error fetching products:', productsError)
  } else {
    allProducts?.forEach(p => {
      console.log(`  - ${p.name} | store: ${p.store_id?.slice(0, 8)}... | user: ${p.user_id?.slice(0, 8)}... | status: ${p.status} | sku: ${p.sku}`)
    })
  }

  // Sehrish products
  const sehrishProducts = allProducts?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  console.log(`\nSehrish products: ${sehrishProducts.length}`)
  sehrishProducts.forEach(p => console.log(`  - ${p.name} (${p.sku}) id: ${p.id}`))

  // Mahrukh products
  const mahrukhProducts = allProducts?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []
  console.log(`\nMahrukh products: ${mahrukhProducts.length}`)
  mahrukhProducts.forEach(p => console.log(`  - ${p.name} (${p.sku}) id: ${p.id}`))

  // Check for cross-store mixing
  const crossStore = allProducts?.filter(p => 
    (p.store_id === SEHRISH_STORE_ID && p.user_id !== '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23') ||
    (p.store_id === MAHRUKH_STORE_ID && p.user_id !== 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1')
  ) || []
  console.log(`\nCross-store mixing: ${crossStore.length}`)
  crossStore.forEach(p => console.log(`  - ${p.name} store: ${p.store_id?.slice(0, 8)} user: ${p.user_id?.slice(0, 8)}`))

  // Check products with old names
  const oldNames = ['Classic Ladies Watch', 'Ladies Accessories', 'Ladies Suit', 'Ladies Shirt', 'Ladies Dress']
  const oldProducts = allProducts?.filter(p => oldNames.includes(p.name)) || []
  console.log(`\nOld-named products: ${oldProducts.length}`)
  oldProducts.forEach(p => console.log(`  - ${p.name} (${p.sku}) store: ${p.store_id?.slice(0, 8)}`))
}

main().catch(console.error)
