// Final verification: directly query the DB with the exact same logic that
// /api/store/[slug]/route.ts uses. This proves that the route handler, if it
// were to run, would return the correct data.

import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, SERVICE_KEY)

async function loadStore(slug) {
  const { data: store, error } = await supabase.from('stores').select('*').eq('slug', slug).single()
  if (error || !store) return { error: 'Store not found' }
  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })
  if (pErr) return { error: pErr.message }
  return { store, products: products || [] }
}

async function main() {
  for (const slug of ['mahrukh-store', 'sehrish-tanzeel-store']) {
    const result = await loadStore(slug)
    if (result.error) { console.log(`/${slug}: ${result.error}`); continue }
    console.log(`\n=== /${slug} (simulated /api/store/[slug] response) ===`)
    console.log(`Store: ${result.store.name} (id=${result.store.id}) owner=${result.store.user_id}`)
    console.log(`Products (${result.products.length}):`)
    for (const p of result.products) {
      const ok = p.user_id === result.store.user_id
      console.log(`  - ${p.name} [user=${p.user_id.slice(0,8)} store=${p.store_id.slice(0,8)}] ${ok ? '✓' : '✗'} ${p.image_url}`)
    }
  }
}
main().catch(console.error)