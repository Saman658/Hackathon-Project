import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

const HOTEL_PRODUCT_ID = '85e469c8-0ef5-4347-8192-c1e80f44e554'

async function main() {
  // 1) Verify target store ownership
  const { data: storeCheck } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()
  if (!storeCheck) {
    console.error('ABORT: target store not found / wrong owner')
    return
  }
  console.log(`Target store: ${storeCheck.name} (slug=${storeCheck.slug}, id=${storeCheck.id})`)

  // 2) Snapshot other store products
  const { data: mahrukhBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
  console.log(`Mahrukh store (before): ${mahrukhBefore?.length} products`)

  // 3) Snapshot Sehrish store products before
  const { data: sehrishBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)
  console.log(`Sehrish store (before): ${sehrishBefore?.length} products`)
  sehrishBefore?.forEach(p => console.log(`  - ${p.name} (${p.sku})`))

  // 4) Check the hotel product still has no order_items refs
  const { data: refs } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', HOTEL_PRODUCT_ID)
  if (refs && refs.length > 0) {
    console.error(`ABORT: hotel product has ${refs.length} order_items refs`)
    return
  }

  // 5) Delete the hotel product
  const { data: deleted, error: delError } = await supabase
    .from('products')
    .delete()
    .eq('id', HOTEL_PRODUCT_ID)
    .eq('store_id', SEHRISH_STORE_ID)
    .select('id, name')
  if (delError) {
    console.error('Error deleting hotel product:', delError)
    return
  }
  console.log(`Deleted hotel product:`, deleted)

  // 6) Insert replacement: a ladies 3-piece suit from the Hamza Ismail reference
  //    (DFC013 is "In stock" on the source page — picking a different design
  //    from the same reference so the 4th slot is still a women's clothing
  //    product tied to one of the provided reference URLs.)
  const replacement = {
    user_id: SEHRISH_USER_ID,
    store_id: SEHRISH_STORE_ID,
    name: "Hamza Ismail | 3PC Unstitched Printed Lawn Suit – DFC013",
    description:
      "A breezy 3-piece unstitched printed lawn suit from the Hamza Ismail collection, refreshed for the latest summer season. The package pairs a printed lawn shirt with a printed lawn trouser and a printed chiffon dupatta, all in one coordinated set. Lightweight, breathable and finished with neat fabric edges, this unstitched suit lets you tailor it to your preferred fit while keeping you comfortable through warm-weather days.",
    sku: 'SEHRISH-HAMZA-DFC013',
    price: 2125,
    stock: 40,
    image_url: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC013-300x450.webp',
    status: 'Active',
  }

  const { data: created, error: createError } = await supabase
    .from('products')
    .insert(replacement)
    .select('id, name, sku, store_id, image_url, price, stock, status')
    .single()
  if (createError) {
    console.error('Error creating replacement:', createError)
    return
  }
  console.log(`Created replacement: ${created.name}`)
  console.log(`  sku=${created.sku} id=${created.id}`)
  console.log(`  image=${created.image_url}`)

  // 7) Final verification
  const { data: sehrishAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id, price, stock, status')
    .eq('store_id', SEHRISH_STORE_ID)
    .order('name')
  console.log(`\nSehrish store (after): ${sehrishAfter?.length} products`)
  sehrishAfter?.forEach(p =>
    console.log(`  - ${p.name} | sku=${p.sku} | $${p.price} | stock=${p.stock} | ${p.status}`)
  )

  const { data: mahrukhAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('name')
  console.log(`\nMahrukh store (after): ${mahrukhAfter?.length} products`)
  mahrukhAfter?.forEach(p => console.log(`  - ${p.name} (${p.sku})`))

  const sameCount = mahrukhBefore?.length === mahrukhAfter?.length
  const sameIds = JSON.stringify((mahrukhBefore || []).map(p => p.id).sort()) ===
                  JSON.stringify((mahrukhAfter || []).map(p => p.id).sort())
  const sameNames = JSON.stringify((mahrukhBefore || []).map(p => p.name).sort()) ===
                    JSON.stringify((mahrukhAfter || []).map(p => p.name).sort())
  console.log(`\nMahrukh untouched: count-match=${sameCount}, ids-match=${sameIds}, names-match=${sameNames}`)

  const cross = sehrishAfter?.filter(p => p.user_id !== SEHRISH_USER_ID).length || 0
  console.log(`Cross-store mixing in Sehrish: ${cross}`)

  const hasHotel = sehrishAfter?.some(p => /hotel|room|stay|aslan/i.test(p.name)).length || 0
  console.log(`Hotel/room products in Sehrish: ${hasHotel}`)
}

main().catch(console.error)
