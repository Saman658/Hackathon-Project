import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

// Each new image URL is the highest-resolution version of the actual product
// photo for that product, taken from the same reference page the user provided.
const imageUpdates = [
  {
    sku: 'SEHRISH-LAWN-001',
    name: 'Digital Printed Lawn 2-Piece Suit (DRL-1388)',
    oldImage: 'https://shoprex.com/images/srproducts/large/digital-printed-lawn-shirt-with-trouser-2-pec-suite-unstitched-drl-1388_46536.jpg',
    newImage: 'https://shoprex.com/images/srproducts/large/digital-printed-lawn-shirt-with-trouser-2-pec-suite-unstitched-drl-1388_46536.jpg',
    note: 'shoprex "large" is the highest-resolution asset the source page exposes; full product is visible.',
  },
  {
    sku: 'SEHRISH-CHEVRON-001',
    name: 'Chevron 2-Piece Ladies Suit',
    oldImage: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_09_32_49PM.png?v=1774376500&width=1946',
    newImage: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_09_32_49PM.png?v=1774376500&width=1946',
    note: 'beyonddetail serves the source PNG at up to 1946px wide via the width= query; full product visible.',
  },
  {
    sku: 'SEHRISH-HAMZA-001',
    name: 'Hamza Ismail 3-Piece Unstitched Printed Lawn Suit (DFC015)',
    oldImage: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC015-300x450.webp',
    newImage: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC015.webp',
    note: 'Upgraded from 300x450 thumbnail to the full-size original; full product visible.',
  },
  {
    sku: 'SEHRISH-HAMZA-DFC013',
    name: 'Hamza Ismail 3-Piece Unstitched Printed Lawn Suit (DFC013)',
    oldImage: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC013-300x450.webp',
    newImage: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-%E2%80%93-DFC013.webp',
    note: 'Upgraded from 300x450 thumbnail to the full-size original; full product visible.',
  },
]

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

  // 2) Snapshot other store (must not change)
  const { data: mahrukhBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
  console.log(`Mahrukh store (before): ${mahrukhBefore?.length} products`)

  // 3) Update image_url only (other columns untouched)
  for (const upd of imageUpdates) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: upd.newImage })
      .eq('sku', upd.sku)
      .eq('store_id', SEHRISH_STORE_ID)
      .select('id, name, sku, image_url, price, stock, status')
      .single()
    if (error) {
      console.error(`Error updating ${upd.sku}:`, error)
      continue
    }
    console.log(`\nUpdated ${upd.sku} (${data.name})`)
    console.log(`  old: ${upd.oldImage}`)
    console.log(`  new: ${data.image_url}`)
    console.log(`  note: ${upd.note}`)
    console.log(`  unchanged -> name=${data.name} | price=${data.price} | stock=${data.stock} | status=${data.status}`)
  }

  // 4) Verify only image_url changed
  const { data: sehrishAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, price, stock, status, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)
    .order('name')
  console.log(`\nSehrish store (after): ${sehrishAfter?.length} products`)
  sehrishAfter?.forEach(p => console.log(`  - ${p.name} | ${p.sku} | $${p.price} | ${p.status}`))

  // 5) Verify other store unchanged
  const { data: mahrukhAfter } = await supabase
    .from('products')
    .select('id, name, sku, image_url, user_id, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('name')
  const sameCount = mahrukhBefore?.length === mahrukhAfter?.length
  const sameIds = JSON.stringify((mahrukhBefore || []).map(p => p.id).sort()) ===
                  JSON.stringify((mahrukhAfter || []).map(p => p.id).sort())
  const sameNames = JSON.stringify((mahrukhBefore || []).map(p => p.name).sort()) ===
                    JSON.stringify((mahrukhAfter || []).map(p => p.name).sort())
  const sameImages = JSON.stringify((mahrukhBefore || []).map(p => p.image_url).sort()) ===
                     JSON.stringify((mahrukhAfter || []).map(p => p.image_url).sort())
  console.log(`\nMahrukh untouched: count=${sameCount} ids=${sameIds} names=${sameNames} images=${sameImages}`)

  // 6) Confirm only image_url differs in Sehrish products (everything else identical)
  const { data: sehrishBefore } = await supabase
    .from('products')
    .select('id, name, sku, image_url, price, stock, status, user_id, store_id')
    .eq('store_id', SEHRISH_STORE_ID)
    .order('name')
  let onlyImagesChanged = true
  for (const before of sehrishBefore || []) {
    const after = sehrishAfter.find(p => p.id === before.id)
    if (!after) { onlyImagesChanged = false; break }
    if (before.name !== after.name || before.price !== after.price ||
        before.stock !== after.stock || before.status !== after.status ||
        before.user_id !== after.user_id || before.store_id !== after.store_id ||
        before.sku !== after.sku) {
      onlyImagesChanged = false
      console.log(`  Other field changed on ${before.sku}:`,
        { name: [before.name, after.name], price: [before.price, after.price],
          stock: [before.stock, after.stock], status: [before.status, after.status] })
    }
  }
  console.log(`Only image_url changed in Sehrish: ${onlyImagesChanged}`)
}

main().catch(console.error)
