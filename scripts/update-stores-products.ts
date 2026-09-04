import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  // === VERIFY store_id ownership BEFORE any product move ===
  console.log('=== Verifying store ownership ===')

  const { data: sehrishStoreCheck, error: sehrishCheckError } = await supabase
    .from('stores')
    .select('id, user_id')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (sehrishCheckError || !sehrishStoreCheck) {
    console.error(`ABORT: Store ${SEHRISH_STORE_ID} is NOT owned by user ${SEHRISH_USER_ID}.`)
    console.error('No products were moved or created.')
    return
  }
  console.log('Verified: Sehrish store owned by Sehrish user')

  const { data: mahrukhStoreCheck, error: mahrukhCheckError } = await supabase
    .from('stores')
    .select('id, user_id')
    .eq('id', MAHRUKH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)
    .single()

  if (mahrukhCheckError || !mahrukhStoreCheck) {
    console.error(`ABORT: Store ${MAHRUKH_STORE_ID} is NOT owned by user ${MAHRUKH_USER_ID}.`)
    console.error('No products were moved or created.')
    return
  }
  console.log('Verified: Mahrukh store owned by Mahrukh user')

  // 1) Update profiles
  console.log('=== Updating profiles ===')
  
  const { error: mahrukhProfileError } = await supabase
    .from('profiles')
    .update({ name: 'Mahrukh', business_name: 'Mahrukh Store' })
    .eq('id', MAHRUKH_USER_ID)
  
  if (mahrukhProfileError) console.error('Mahrukh profile update error:', mahrukhProfileError)
  else console.log('Mahrukh profile updated')

  // 2) Update stores
  console.log('\n=== Updating stores ===')
  
  const { error: mahrukhStoreError } = await supabase
    .from('stores')
    .update({ name: 'Mahrukh Store', slug: 'mahrukh-store' })
    .eq('id', MAHRUKH_STORE_ID)
  
  if (mahrukhStoreError) console.error('Mahrukh store update error:', mahrukhStoreError)
  else console.log('Mahrukh store updated')

  const { error: sehrishStoreError } = await supabase
    .from('stores')
    .update({ name: 'Sehrish Tanzeel Store', slug: 'sehrish-tanzeel-store' })
    .eq('id', SEHRISH_STORE_ID)
  
  if (sehrishStoreError) console.error('Sehrish store update error:', sehrishStoreError)
  else console.log('Sehrish store updated')

  // 3) Move all products to Sehrish's store
  console.log('\n=== Moving all products to Sehrish Tanzeel Store ===')
  
  // Update Mahrukh's products user_id and store_id
  const mahrukhProductIds = [
    '8c7795d2-4980-4f28-8721-f7e32d0c8293',
    '85d8542b-839b-4495-a1d1-de3d20086cbf',
    'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e',
  ]

  for (const id of mahrukhProductIds) {
    const { error } = await supabase
      .from('products')
      .update({ user_id: SEHRISH_USER_ID, store_id: SEHRISH_STORE_ID })
      .eq('id', id)
    
    if (error) console.error(`Error moving product ${id}:`, error)
    else console.log(`Moved product ${id}`)
  }

  // Update Sehrish's products store_id (user_id already correct)
  const sehrishProductIds = [
    '79c8759e-6d5f-4d0a-b214-ff27acd71c13',
    'e5fa7b9c-5445-4a50-ac61-0e04dd02fcad',
    '2f3985d3-cd25-41b6-a0ea-90b631d9ef37',
  ]

  for (const id of sehrishProductIds) {
    const { error } = await supabase
      .from('products')
      .update({ store_id: SEHRISH_STORE_ID })
      .eq('id', id)
    
    if (error) console.error(`Error updating product ${id}:`, error)
    else console.log(`Updated store_id for product ${id}`)
  }

  // 4) Create Mahrukh's new products
  console.log('\n=== Creating Mahrukh products ===')
  
  const mahrukhProducts = [
    {
      name: 'Ladies Suit',
      sku: 'MAHRUKH-SUIT-001',
      price: 89,
      stock: 50,
      image_url: '/products/add-on-pack.svg',
      description: 'Elegant ladies suit crafted for special occasions and everyday elegance. Premium fabric with modern tailoring.',
      status: 'Active',
    },
    {
      name: 'Ladies Shirt',
      sku: 'MAHRUKH-SHIRT-001',
      price: 45,
      stock: 100,
      image_url: '/products/premium-plan.svg',
      description: 'Stylish ladies shirt designed for comfort and fashion. A versatile addition to any wardrobe.',
      status: 'Active',
    },
    {
      name: 'Ladies Accessories',
      sku: 'MAHRUKH-ACC-001',
      price: 25,
      stock: 200,
      image_url: '/products/classic-ladies-watch.svg',
      description: 'Complete your look with our curated ladies accessories collection. Trendy and timeless pieces.',
      status: 'Active',
    },
  ]

  for (const product of mahrukhProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        user_id: MAHRUKH_USER_ID,
        store_id: MAHRUKH_STORE_ID,
      })
      .select('*')
      .single()
    
    if (error) console.error(`Error creating product ${product.name}:`, error)
    else console.log(`Created product ${product.name}:`, data.id)
  }

  // 5) Verify
  console.log('\n=== Verification ===')
  
  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, user_id, slug')
  
  console.log('\nStores:', JSON.stringify(stores, null, 2))

  const { data: products } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url')
    .order('created_at', { ascending: true })
  
  console.log('\nProducts:', JSON.stringify(products, null, 2))

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
  
  console.log('\nProfiles:', JSON.stringify(profiles, null, 2))
}

main().catch(console.error)
