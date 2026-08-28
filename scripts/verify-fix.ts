import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  // Count products per user
  const { count: sehrishCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', SEHRISH_USER_ID)
  
  const { count: mahrukhCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', MAHRUKH_USER_ID)

  console.log(`Sehrish products count: ${sehrishCount}`)
  console.log(`Mahrukh products count: ${mahrukhCount}`)

  // Count products per store
  const { count: sehrishStoreCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', SEHRISH_STORE_ID)
  
  const { count: mahrukhStoreCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', MAHRUKH_STORE_ID)

  console.log(`Sehrish Tanzeel Store products count: ${sehrishStoreCount}`)
  console.log(`Mahrukh Store products count: ${mahrukhStoreCount}`)

  // Verify store ownership
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, user_id, slug')
  
  console.log('\nStores:', JSON.stringify(stores, null, 2))

  // Verify no Mahrukh products in Sehrish store and vice versa
  const { data: mahrukhProductsInSehrishStore } = await supabase
    .from('products')
    .select('id, name, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)

  const { data: sehrishProductsInMahrukhStore } = await supabase
    .from('products')
    .select('id, name, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)

  console.log('\nMahrukh products in Sehrish store:', JSON.stringify(mahrukhProductsInSehrishStore, null, 2))
  console.log('Sehrish products in Mahrukh store:', JSON.stringify(sehrishProductsInMahrukhStore, null, 2))

  // List all products with details
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description')
    .order('created_at', { ascending: true })
  
  console.log('\nAll products:', JSON.stringify(allProducts, null, 2))
}

main().catch(console.error)
