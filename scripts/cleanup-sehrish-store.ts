import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  // VERIFY store_id ownership before any product changes
  const { data: storeCheck, error: storeCheckError } = await supabase
    .from('stores')
    .select('id, user_id, name')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (storeCheckError || !storeCheck) {
    console.error(`ABORT: Store ${SEHRISH_STORE_ID} is NOT owned by user ${SEHRISH_USER_ID}.`)
    console.error('No products were created or updated.')
    return
  }
  console.log(`Verified: ${storeCheck.name} owned by user ${SEHRISH_USER_ID}`)

  // 1) Rename Classic Ladies Watch to Ladies Watch
  const { data: updatedWatch, error: watchError } = await supabase
    .from('products')
    .update({ name: 'Ladies Watch' })
    .eq('id', 'e5fa7b9c-5445-4a50-ac61-0e04dd02fcad')
    .eq('store_id', SEHRISH_STORE_ID)
    .select('id, name')
    .single()

  if (watchError) {
    console.error('Error renaming Ladies Watch:', watchError)
  } else {
    console.log('Renamed to Ladies Watch:', updatedWatch)
  }

  // 2) Add missing products to Sehrish's store
  const newProducts = [
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Shoes',
      description: 'Stylish and comfortable shoes for every occasion. Durable construction with modern design.',
      sku: 'SHOES-001',
      price: 35,
      stock: 150,
      image_url: '/categories/ladies-suits.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Headphone',
      description: 'Premium quality headphones with crystal clear sound and comfortable fit for long listening sessions.',
      sku: 'HEADPHONE-001',
      price: 55,
      stock: 80,
      image_url: '/categories/ladies-shirts.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Baby Girl Shirt',
      description: 'Adorable baby girl shirt made from soft, breathable fabric. Perfect for everyday wear and special moments.',
      sku: 'BABY-SHIRT-001',
      price: 20,
      stock: 200,
      image_url: '/categories/ladies-shirts.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Frock',
      description: 'Beautiful frock designed with premium fabric and elegant stitching. Ideal for casual and formal occasions.',
      sku: 'FROCK-001',
      price: 40,
      stock: 120,
      image_url: '/categories/frocks.jpg',
      status: 'Active',
    },
  ]

  for (const product of newProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select('id, name, store_id')
      .single()

    if (error) {
      console.error(`Error creating ${product.name}:`, error)
    } else {
      console.log(`Created ${product.name}:`, data)
    }
  }

  // 3) Verify final state
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url')
    .order('created_at', { ascending: true })

  const sehrishProducts = allProducts?.filter(p => p.store_id === SEHRISH_STORE_ID) || []
  const mahrukhProducts = allProducts?.filter(p => p.store_id === MAHRUKH_STORE_ID) || []

  console.log('\n=== FINAL VERIFICATION ===')
  console.log(`Sehrish Store products: ${sehrishProducts.length}`)
  sehrishProducts.forEach(p => console.log(`  - ${p.name} (${p.sku})`))
  console.log(`Mahrukh Store products: ${mahrukhProducts.length}`)
  mahrukhProducts.forEach(p => console.log(`  - ${p.name} (${p.sku})`))

  const crossStore = sehrishProducts.filter(p => p.user_id === MAHRUKH_USER_ID).length + mahrukhProducts.filter(p => p.user_id === SEHRISH_USER_ID).length
  console.log(`Cross-store mixing: ${crossStore}`)
}

main().catch(console.error)
