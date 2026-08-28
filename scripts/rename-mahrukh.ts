import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  // 1) Update profile
  console.log('=== Updating profile ===')
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .update({ name: 'Mahrukh', business_name: 'Mahrukh Store' })
    .eq('id', MAHRUKH_USER_ID)
    .select('id, name, business_name')

  if (profileError) {
    console.error('Profile update error:', profileError)
    process.exit(1)
  }
  console.log('Profile updated:', JSON.stringify(profileData, null, 2))

  // 2) Update store
  console.log('\n=== Updating store ===')
  const { data: storeData, error: storeError } = await supabase
    .from('stores')
    .update({ name: 'Mahrukh Store', slug: 'mahrukh-store' })
    .eq('id', MAHRUKH_STORE_ID)
    .select('id, name, slug, user_id')

  if (storeError) {
    console.error('Store update error:', storeError)
    process.exit(1)
  }
  console.log('Store updated:', JSON.stringify(storeData, null, 2))

  // 3) Update product SKUs
  console.log('\n=== Updating product SKUs ===')
  const products = [
    { id: 'b66be7dd-eb2d-4bf0-839c-336aef4ca7eb', sku: 'MAHRUKH-SUIT-001' },
    { id: '6836a4e0-7dfa-492a-b64b-bf7435466623', sku: 'MAHRUKH-SHIRT-001' },
    { id: 'b2864dd1-f3b2-4a38-8aed-ce75e27f74da', sku: 'MAHRUKH-ACC-001' },
  ]

  for (const product of products) {
    const { data, error } = await supabase
      .from('products')
      .update({ sku: product.sku })
      .eq('id', product.id)
      .select('id, name, sku')
    
    if (error) {
      console.error(`Error updating product ${product.id}:`, error)
    } else {
      console.log(`Updated product ${product.id}:`, JSON.stringify(data, null, 2))
    }
  }

  // 4) Verification
  console.log('\n=== Final Verification ===')
  
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, user_id, slug')
  
  if (storesError) console.error('Stores error:', storesError)
  else console.log('\nStores:', JSON.stringify(stores, null, 2))

  const { data: allProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, description')
    .order('created_at', { ascending: true })
  
  if (productsError) console.error('Products error:', productsError)
  else console.log('\nProducts:', JSON.stringify(allProducts, null, 2))

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', MAHRUKH_USER_ID)
  
  if (profilesError) console.error('Profiles error:', profilesError)
  else console.log('\nProfiles:', JSON.stringify(profiles, null, 2))

  // Check auth metadata
  const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(MAHRUKH_USER_ID)
  if (authError) console.error('Auth error:', authError)
  else {
    console.log('\nAuth user:', JSON.stringify({
      id: user?.id,
      email: user?.email,
      email_confirmed_at: user?.email_confirmed_at,
      raw_user_meta_data: user?.user_metadata,
    }, null, 2))
  }
}

main().catch(console.error)
