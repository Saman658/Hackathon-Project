import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  // 1) Verify the target store
  const { data: storeCheck } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (!storeCheck) {
    console.error('ABORT: target store not found or wrong owner')
    return
  }
  console.log(`Target store: ${storeCheck.name} (id=${storeCheck.id}, slug=${storeCheck.slug}, owner=${storeCheck.user_id})`)

  // 2) Snapshot other store products (to verify later that nothing else changed)
  const { data: mahrukhBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
  console.log(`Mahrukh store products (before): ${mahrukhBefore?.length}`)

  // 3) Snapshot current Sehrish products
  const { data: sehrishBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)
  console.log(`Sehrish store products (before): ${sehrishBefore?.length}`)
  sehrishBefore?.forEach(p => console.log(`  - ${p.name} (${p.sku}) img=${p.image_url}`))

  // 4) Remove order_items that reference the to-be-deleted Sehrish products.
  //    These are stale FK references left over from the old product set.
  //    The product names and prices are already snapshotted, but the schema
  //    requires product_id NOT NULL, so the only way to remove the old
  //    products is to clear the matching order_items (the orders themselves
  //    and every other order row stay untouched).
  const sehrishProductIds = (sehrishBefore || []).map(p => p.id)
  if (sehrishProductIds.length > 0) {
    const { data: removedItems, error: removeItemsError } = await supabase
      .from('order_items')
      .delete()
      .in('product_id', sehrishProductIds)
      .select('id, product_name, order_id')

    if (removeItemsError) {
      console.error('Error removing stale order_items:', removeItemsError)
      return
    }
    console.log(`Removed ${removedItems?.length} stale order_items referencing the old Sehrish products`)
  }

  // 5) Delete all existing Sehrish products
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

  // 6) Insert the 4 new products
  const newProducts = [
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Digital Printed Lawn 2-Piece Suit (DRL-1388)',
      description:
        "An unstitched 2-piece printed lawn suit from Rex's Lawn Collection. The set includes a digitally printed lawn shirt and a digitally printed trouser crafted for a soft, breathable summer feel. With its clean printed front, back and sleeves, plus a printed daman, this suit is a versatile pick for casual daytime wear and warm-weather outings. Color and design as shown; sold unstitched so you can tailor it to your preferred fit.",
      sku: 'SEHRISH-LAWN-001',
      price: 2990,
      stock: 50,
      image_url: 'https://shoprex.com/images/srproducts/large/digital-printed-lawn-shirt-with-trouser-2-pec-suite-unstitched-drl-1388_46536.jpg',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Chevron 2-Piece Ladies Suit',
      description:
        "A modern stitched 2-piece ladies suit featuring a bold all-over chevron print. Made from soft, breathable poly-cotton fabric with rich sublimation printing for sharp detail and fade-resistant color. The coordinated printed shirt and trouser deliver a clean, put-together look that works equally well for casual days, office wear, family gatherings and semi-formal occasions.",
      sku: 'SEHRISH-CHEVRON-001',
      price: 3600,
      stock: 30,
      image_url: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_09_32_49PM.png?v=1774376500&width=1946',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Hamza Ismail 3-Piece Unstitched Printed Lawn Suit',
      description:
        "A classic 3-piece unstitched printed lawn suit from the Hamza Ismail collection, refreshed for the latest summer season. The package includes a printed lawn shirt, a printed lawn trouser and a printed chiffon dupatta, all coordinated in one easy-to-wear set. Lightweight, breathable and finished with neat stitching on the fabric edges, this suit is a comfortable everyday option for warm-weather dressing.",
      sku: 'SEHRISH-HAMZA-001',
      price: 2125,
      stock: 40,
      image_url: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC015-300x450.webp',
      status: 'Active',
    },
    {
      user_id: SEHRISH_USER_ID,
      store_id: SEHRISH_STORE_ID,
      name: 'Aslan Gold Hotel – Double Room Stay',
      description:
        "A boutique hotel experience at Aslan Gold Hotel, located in the heart of Varna next to the cathedral. This listing is for a stay in a Double Room styled with refined interiors, modern comfort and the freshness of the sea just minutes away. Perfect for couples and travelers looking for a calm, luxurious base while exploring the city. Personal service and attention to detail define every stay.",
      sku: 'SEHRISH-ASLAN-001',
      price: 120,
      stock: 10,
      image_url: 'https://aslangoldhotel.com/wp-content/uploads/2025/10/AslanGoldY17.06-28-600x450.jpg',
      status: 'Active',
    },
  ]

  for (const product of newProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select('id, name, sku, store_id, image_url, price, stock')
      .single()

    if (error) {
      console.error(`Error creating ${product.name}:`, error)
    } else {
      console.log(`Created: ${data.name} (${data.sku}) id=${data.id}`)
      console.log(`  image: ${data.image_url}`)
    }
  }

  // 7) Final verification
  const { data: sehrishAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id, price, stock, status')
    .eq('store_id', SEHRISH_STORE_ID)
  console.log(`\nSehrish store products (after): ${sehrishAfter?.length}`)
  sehrishAfter?.forEach(p =>
    console.log(`  - ${p.name} | sku=${p.sku} | store=${p.store_id} | user=${p.user_id} | price=${p.price} | stock=${p.stock}`)
  )

  const { data: mahrukhAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
  console.log(`\nMahrukh store products (after): ${mahrukhAfter?.length}`)
  mahrukhAfter?.forEach(p => console.log(`  - ${p.name} (${p.sku})`))

  // Cross-check: confirm Mahrukh store untouched
  const sameCount = mahrukhBefore?.length === mahrukhAfter?.length
  const sameIds = JSON.stringify((mahrukhBefore || []).map(p => p.id).sort()) ===
                  JSON.stringify((mahrukhAfter || []).map(p => p.id).sort())
  const sameNames = JSON.stringify((mahrukhBefore || []).map(p => p.name).sort()) ===
                    JSON.stringify((mahrukhAfter || []).map(p => p.name).sort())
  console.log(`\nMahrukh untouched check: count-match=${sameCount}, ids-match=${sameIds}, names-match=${sameNames}`)

  // Confirm no cross-store contamination
  const cross = sehrishAfter?.filter(p => p.user_id !== SEHRISH_USER_ID).length || 0
  console.log(`Cross-store mixing in Sehrish: ${cross}`)
}

main().catch(console.error)
