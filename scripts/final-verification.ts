import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  const { data: stores } = await supabase.from('stores').select('*')
  console.log('=== STORES ===')
  console.log(JSON.stringify(stores, null, 2))

  const { data: allProducts } = await supabase.from('products').select('*').order('created_at', { ascending: true })
  console.log('\n=== ALL PRODUCTS ===')
  console.log(JSON.stringify(allProducts, null, 2))

  const sehrishProducts = allProducts?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  const mahrukhProducts = allProducts?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []

  console.log(`\nSehrish Store products count: ${sehrishProducts.length}`)
  console.log(`Mahrukh Store products count: ${mahrukhProducts.length}`)

  const mahrukhInSehrish = sehrishProducts.filter(p => p.user_id === MAHRUKH_USER_ID)
  const sehrishInMahrukh = mahrukhProducts.filter(p => p.user_id === SEHRISH_USER_ID)
  console.log(`Cross-store mixing: ${mahrukhInSehrish.length + sehrishInMahrukh.length}`)

  console.log('\n=== VERIFICATION RESULT ===')
  console.log(`Sehrish Store = ${sehrishProducts.length} original Sehrish products: ${sehrishProducts.map(p => p.name).join(', ')}`)
  console.log(`Mahrukh Store = ${mahrukhProducts.length} original Mahrukh products: ${mahrukhProducts.map(p => p.name).join(', ') || '(none found)'}`)
  console.log(`Cross-store mixing = ${mahrukhInSehrish.length + sehrishInMahrukh.length}`)
}

main().catch(console.error)
