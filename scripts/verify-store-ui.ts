import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  console.log('=== DETAILED STORE VERIFICATION ===\n')

  const { data: stores } = await supabase
    .from('stores')
    .select('id, user_id, name, slug, description, logo, hero_title, hero_description, created_at, updated_at')
    .order('created_at', { ascending: true })

  console.log('--- ALL STORES (full fields) ---')
  console.log(JSON.stringify(stores, null, 2))

  // Check what /store page would see for each user
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'

  console.log('\n--- Store that /store would show for Sehrish (user 7eb03ea7) ---')
  const { data: sehrishStores } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', SEHRISH_USER_ID)
    .order('created_at', { ascending: true })
    .limit(1)
  console.log(JSON.stringify(sehrishStores, null, 2))

  console.log('\n--- Store that /store would show for Mahrukh (user cf2fc82a) ---')
  const { data: mahrukhStores } = await supabase
    .from('stores')
    .select('*')
    .eq('user_id', MAHRUKH_USER_ID)
    .order('created_at', { ascending: true })
    .limit(1)
  console.log(JSON.stringify(mahrukhStores, null, 2))

  // Check products shown on each storefront
  console.log('\n--- Products on Sehrish storefront (sehrish-tanzeel-store) ---')
  const { data: sehrishProducts } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description')
    .eq('store_id', 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
  console.log(JSON.stringify(sehrishProducts, null, 2))

  console.log('\n--- Products on Mahrukh storefront (mahrukh-store) ---')
  const { data: mahrukhProducts } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description')
    .eq('store_id', 'd465ed93-a315-45d9-baab-617c2a577a6b')
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
  console.log(JSON.stringify(mahrukhProducts, null, 2))
}

main().catch(console.error)
