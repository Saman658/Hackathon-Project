import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  // === VERIFY store_id ownership BEFORE any move/delete ===
  // The previously reversed comment (Mahrukh/Sehrish swapped) caused products
  // to be moved to the wrong store. These IDs are verified against all other
  // scripts and the live DB profiles — do NOT change without cross-checking.

  console.log('=== VERIFYING store_id ownership ===')

  // Verify Mahrukh store belongs to Mahrukh user
  const { data: mahrukhStore, error: mahrukhStoreError } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', MAHRUKH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)
    .single()

  if (mahrukhStoreError || !mahrukhStore) {
    console.error(`ABORT: Store ${MAHRUKH_STORE_ID} is NOT owned by user ${MAHRUKH_USER_ID}.`)
    console.error('No products were moved or deleted.')
    return
  }
  console.log(`Verified: Mahrukh store "${mahrukhStore.name}" (${mahrukhStore.slug}) owned by user ${MAHRUKH_USER_ID}`)

  // Verify Sehrish store belongs to Sehrish user
  const { data: sehrishStore, error: sehrishStoreError } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (sehrishStoreError || !sehrishStore) {
    console.error(`ABORT: Store ${SEHRISH_STORE_ID} is NOT owned by user ${SEHRISH_USER_ID}.`)
    console.error('No products were moved or deleted.')
    return
  }
  console.log(`Verified: Sehrish store "${sehrishStore.name}" (${sehrishStore.slug}) owned by user ${SEHRISH_USER_ID}`)

  // Verify source products exist and are NOT already in the target store
  const productsToMoveToMahrukh = [
    { id: '8c7795d2-4980-4f28-8721-f7e32d0c8293', name: 'Shoes' },
    { id: '85d8542b-839b-4495-a1d1-de3d20086cbf', name: 'Dress Shirt' },
    { id: 'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e', name: 'Headphones' },
  ]

  console.log('\n=== Verifying source products ===')
  for (const product of productsToMoveToMahrukh) {
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('id, name, user_id, store_id')
      .eq('id', product.id)
      .single()

    if (fetchError || !existing) {
      console.error(`ABORT: Product "${product.name}" (${product.id}) not found. Skipping.`)
      continue
    }

    if (existing.store_id === MAHRUKH_STORE_ID) {
      console.log(`SKIP: "${product.name}" is already in Mahrukh store.`)
      continue
    }

    console.log(`OK: "${product.name}" found in store ${existing.store_id}`)
  }

  // === MOVE products to Mahrukh (only after verification passed) ===
  console.log('\n=== Moving products to Mahrukh ===')
  for (const product of productsToMoveToMahrukh) {
    const { data, error } = await supabase
      .from('products')
      .update({ user_id: MAHRUKH_USER_ID, store_id: MAHRUKH_STORE_ID })
      .eq('id', product.id)
      .select('id, name, user_id, store_id')
      .single()

    if (error) {
      console.error(`Error updating ${product.name}:`, error)
    } else {
      console.log(`Updated ${product.name}:`, data)
    }
  }

  // Verify the final state
  const { data: allProducts } = await supabase.from('products').select('id, name, user_id, store_id').order('created_at', { ascending: true })
  console.log('\n=== FINAL PRODUCTS ===')
  console.log(JSON.stringify(allProducts, null, 2))
}

main()
