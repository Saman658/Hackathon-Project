import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  console.log('=== STORES ===')
  const { data: stores, error: se } = await supabase.from('stores').select('id, user_id, name, slug, description, logo').order('created_at', { ascending: true })
  if (se) { console.error(se); return }
  for (const s of stores || []) {
    console.log(`  ${s.name} | slug=${s.slug} | store_id=${s.id} | user_id=${s.user_id}`)
  }

  console.log('\n=== PROFILES ===')
  const { data: profiles, error: pe } = await supabase.from('profiles').select('id, name, business_name, email')
  if (pe) { console.error(pe); return }
  for (const p of profiles || []) {
    console.log(`  ${p.name || '(no name)'} | business=${p.business_name || '(none)'} | email=${p.email} | id=${p.id}`)
  }

  console.log('\n=== PRODUCTS ===')
  const { data: products, error: pre } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, price, stock, status, image_url, created_at')
    .order('created_at', { ascending: true })
  if (pre) { console.error(pre); return }
  for (const p of products || []) {
    console.log(`  ${p.name} | sku=${p.sku} | status=${p.status}`)
    console.log(`     product_id=${p.id}`)
    console.log(`     user_id=${p.user_id}`)
    console.log(`     store_id=${p.store_id}`)
    console.log(`     image_url=${p.image_url}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })