import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  // ===== Step 1: Verify store ownership =====
  console.log('=== Verifying store ownership ===')
  const { data: sehrishStore, error: seErr } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (seErr || !sehrishStore) {
    console.error('ABORT: Sehrish store ownership check failed')
    return
  }
  console.log(`OK: Sehrish store "${sehrishStore.name}" owned by ${SEHRISH_USER_ID}`)

  const { data: mahrukhStore, error: meErr } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', MAHRUKH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)
    .single()

  if (meErr || !mahrukhStore) {
    console.error('ABORT: Mahrukh store ownership check failed')
    return
  }
  console.log(`OK: Mahrukh store "${mahrukhStore.name}" owned by ${MAHRUKH_USER_ID}`)

  // ===== Step 2: Snapshot Mahrukh products (must not change) =====
  console.log('\n=== Snapshotting Mahrukh products ===')
  const { data: mahrukhBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)

  console.log(`Mahrukh store products (before): ${mahrukhBefore?.length}`)

  // ===== Step 3: Snapshot current Sehrish products =====
  console.log('\n=== Snapshotting current Sehrish products ===')
  const { data: sehrishBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)

  console.log(`Sehrish store products (before): ${sehrishBefore?.length}`)
  sehrishBefore?.forEach(p => console.log(`  - ${p.name} (${p.sku})`))

  // ===== Step 4: Remove order_items referencing current Sehrish products =====
  const sehrishProductIds = (sehrishBefore || []).map(p => p.id)
  if (sehrishProductIds.length > 0) {
    console.log('\n=== Removing stale order_items ===')
    const { data: removedItems, error: removeItemsError } = await supabase
      .from('order_items')
      .delete()
      .in('product_id', sehrishProductIds)
      .select('id, product_name, order_id')

    if (removeItemsError) {
      console.error('Error removing stale order_items:', removeItemsError)
      return
    }
    console.log(`Removed ${removedItems?.length} stale order_items`)
  }

  // ===== Step 5: Delete all existing Sehrish products =====
  console.log('\n=== Deleting current Sehrish products ===')
  const { data: deleted, error: delError } = await supabase
    .from('products')
    .delete()
    .eq('store_id', SEHRISH_STORE_ID)
    .select('id, name')

  if (delError) {
    console.error('Error deleting old products:', delError)
    return
  }
  console.log(`Deleted ${deleted?.length} old products`)

  // ===== Step 6: Insert the 6 original Sehrish products =====
  console.log('\n=== Inserting original Sehrish products ===')

  const originalProducts = [
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Add-on Pack',
      description: 'Versatile add-on pack with essential accessories and extras to complement your purchase. Great value bundle for enhanced utility.',
      sku: 'ADD-ON-001',
      price: 25,
      stock: 100,
      image_url: '/products/add-on-pack.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Classic Ladies Watch',
      description: 'Elegant classic ladies watch with timeless design and premium finish. A perfect accessory for any outfit, combining style and functionality.',
      sku: 'WATCH-001',
      price: 45,
      stock: 60,
      image_url: '/products/classic-ladies-watch.jpg',
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
      image_url: '/products/headphones.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Suit Piece',
      description: 'High-quality suit piece crafted from premium fabric. Perfect for formal occasions and everyday elegance. Tailored for a perfect fit.',
      sku: 'SUIT-001',
      price: 65,
      stock: 45,
      image_url: '/products/mens-suit-piece.jpg',
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
      image_url: '/products/baby-girl-frock.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Shoes',
      description: 'Stylish and comfortable shoes for every occasion. Durable construction with modern design.',
      sku: 'SHOES-001',
      price: 35,
      stock: 150,
      image_url: '/products/shoes.jpg',
      status: 'Active',
    },
  ]

  for (const product of originalProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select('id, name, sku, store_id, image_url, price, stock, status')
      .single()

    if (error) {
      console.error(`Error creating ${product.name}:`, error)
    } else {
      console.log(`Created: ${data.name} (${data.sku}) id=${data.id}`)
      console.log(`  image: ${data.image_url}`)
    }
  }

  // ===== Step 7: Final verification =====
  console.log('\n=== Final verification ===')

  const { data: mahrukhAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)

  const sameCount = mahrukhBefore?.length === mahrukhAfter?.length
  const sameIds = JSON.stringify((mahrukhBefore || []).map(p => p.id).sort()) ===
                  JSON.stringify((mahrukhAfter || []).map(p => p.id).sort())
  const sameNames = JSON.stringify((mahrukhBefore || []).map(p => p.name).sort()) ===
                    JSON.stringify((mahrukhAfter || []).map(p => p.name).sort())
  console.log(`\nMahrukh untouched: count=${sameCount} ids=${sameIds} names=${sameNames}`)

  const { data: sehrishAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id, price, stock, status')
    .eq('store_id', SEHRISH_STORE_ID)

  console.log(`\nSehrish store products (after): ${sehrishAfter?.length}`)
  sehrishAfter?.forEach(p =>
    console.log(`  - ${p.name} | sku=${p.sku} | $${p.price} | stock=${p.stock} | ${p.status}`)
  )

  const cross = sehrishAfter?.filter(p => p.user_id !== SEHRISH_USER_ID).length || 0
  console.log(`\nCross-store mixing in Sehrish: ${cross}`)
}

main().catch(e => { console.error(e); process.exit(1) })
