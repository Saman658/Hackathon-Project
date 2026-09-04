import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const { data: store, error: storeErr } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .eq('slug', 'mahrukh-store')
    .single()

  if (storeErr || !store) {
    console.error('Store fetch error:', storeErr)
    return
  }
  console.log('STORE:', JSON.stringify(store, null, 2))

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url, store_id, user_id, created_at')
    .eq('store_id', store.id)
    .order('created_at', { ascending: true })

  if (prodErr) {
    console.error('Products fetch error:', prodErr)
    return
  }
  console.log('PRODUCTS:')
  products?.forEach(p => {
    console.log(JSON.stringify(p, null, 2))
  })
}

main().catch(console.error)