import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, name, email, business_name')
  
  console.log('\n=== ALL PROFILES ===')
  profiles?.forEach(p => console.log(`  - ${p.name} (${p.email}) business: ${p.business_name} id: ${p.id}`))

  const { data: stores } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
  
  console.log('\n=== ALL STORES ===')
  stores?.forEach(s => console.log(`  - ${s.name} (${s.slug}) user: ${s.user_id?.slice(0, 8)}... id: ${s.id}`))

  const { data: products } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, status, sku')
    .order('created_at', { ascending: true })
  
  console.log('\n=== ALL PRODUCTS ===')
  products?.forEach(p => console.log(`  - ${p.name} | user: ${p.user_id?.slice(0, 8)}... | store: ${p.store_id?.slice(0, 8)}... | status: ${p.status} | sku: ${p.sku}`))
}

main().catch(console.error)
