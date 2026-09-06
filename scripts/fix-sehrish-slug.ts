// Fix Sehrish's store metadata: change slug "m" -> "s" and rename from
// "Mahrukh Ariqa Store" to "Sehrish Store". Products are NOT touched.
// This restores the URL /api/store/s -> Sehrish's 6 products.

import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, SERVICE_KEY)

async function main() {
  // 1) Ensure slug `s` is free (it should be, but be defensive)
  const { data: existing } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('slug', 's')
  console.log('Stores currently using slug "s":', existing)

  // 2) Find Sehrish's store (user_id from check-db-state.ts) and update slug/name
  const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

  const before = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('id', SEHRISH_STORE_ID)
    .single()
  console.log('Sehrish store BEFORE:', before.data)

  const { error: updateErr } = await supabase
    .from('stores')
    .update({ slug: 's', name: 'Sehrish Store' })
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)

  if (updateErr) {
    console.error('Update error:', updateErr)
    process.exit(1)
  }

  const after = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('id', SEHRISH_STORE_ID)
    .single()
  console.log('Sehrish store AFTER:', after.data)

  // 3) Confirm Mahrukh's store is untouched
  const mahrukh = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('id', 'd465ed93-a315-45d9-baab-617c2a577a6b')
    .single()
  console.log('Mahrukh store (must be unchanged):', mahrukh.data)

  // 4) Confirm product counts per store are unchanged
  const sehrishProducts = await supabase
    .from('products')
    .select('id, name, sku')
    .eq('store_id', SEHRISH_STORE_ID)
    .eq('status', 'Active')
  const mahrukhProducts = await supabase
    .from('products')
    .select('id, name, sku')
    .eq('store_id', 'd465ed93-a315-45d9-baab-617c2a577a6b')
    .eq('status', 'Active')
  console.log(`Sehrish active products: ${sehrishProducts.data?.length}`)
  for (const p of sehrishProducts.data || []) console.log('  -', p.sku, p.name)
  console.log(`Mahrukh active products: ${mahrukhProducts.data?.length}`)
  for (const p of mahrukhProducts.data || []) console.log('  -', p.sku, p.name)
}
main().catch((e) => { console.error(e); process.exit(1) })
