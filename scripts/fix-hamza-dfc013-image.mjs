import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

// "Mahrukh Ariqa Store" = store id d75917db-b09b-4e7a-acb8-9cfb0ac32df9 (slug "m")
const MAHRUKH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

const TARGET_NAME = 'Hamza Ismail | 3PC Unstitched Printed Lawn Suit – DFC013'
const TARGET_SKU = 'SEHRISH-HAMZA-DFC013'

const NEW_IMAGE_URL =
  'https://www.stylesgap.com/wp-content/uploads/2018/10/3-piece-suits-Kayseria-Best-Winter-Dresses-Collection-2019-for-Women-Little-Girls-3.jpg'

async function main() {
  // "Without this, don't change anything": only act if the picture currently
  // exists in the Mahrukh store. Locate it by exact name + store.
  const { data: target, error: findErr } = await supabase
    .from('products')
    .select('id, name, sku, store_id, image_url')
    .eq('store_id', MAHRUKH_STORE_ID)
    .eq('name', TARGET_NAME)
    .maybeSingle()

  if (findErr) {
    console.error('Query error:', findErr.message)
    return
  }

  if (!target) {
    console.log(
      `NOT FOUND: product "${TARGET_NAME}" (sku=${TARGET_SKU}) in Mahrukh store — no changes made.`
    )
    return
  }

  const already = target.image_url === NEW_IMAGE_URL
  if (already) {
    console.log(
      `No change needed: "${TARGET_NAME}" already uses the target stylesgap image.`
    )
    return
  }

  console.log(`Current image: ${target.image_url}`)
  console.log(`New image:     ${NEW_IMAGE_URL}`)

  const { data: updated, error: updErr } = await supabase
    .from('products')
    .update({ image_url: NEW_IMAGE_URL })
    .eq('id', target.id)
    .eq('store_id', MAHRUKH_STORE_ID)
    .eq('name', TARGET_NAME)
    .select('id, name, sku, store_id, image_url')
    .single()

  if (updErr) {
    console.error('Update error:', updErr.message)
    return
  }

  console.log(`Replaced picture for "${updated.name}" (sku=${updated.sku})`)
  console.log(`  id=${updated.id}`)
  console.log(`  store=${updated.store_id}`)
  console.log(`  image_url=${updated.image_url}`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
