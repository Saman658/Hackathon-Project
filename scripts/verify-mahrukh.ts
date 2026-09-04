import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url, created_at')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  console.log('count:', products?.length || 0)
  for (const p of products || []) {
    console.log(`[${p.sku}] ${p.name}`)
    console.log(`  price=${p.price} stock=${p.stock} status=${p.status}`)
    console.log(`  image: ${p.image_url}`)
    console.log(`  created_at: ${p.created_at}`)
  }
  if (error) console.error('err:', error)
}

main().catch(console.error)