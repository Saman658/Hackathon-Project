import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

function isSuitProduct(product) {
  const n = (product?.name || '').toLowerCase()
  const c = (product?.category || '').toLowerCase()
  return n.includes('suit') || c === 'ladies-suits' || c.includes('suit')
}

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url, description, category, store_id, user_id, created_at, updated_at')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching Mahrukh Ariqa products:', error)
    process.exit(1)
  }

  const allMahrukh = products || []
  const suits = allMahrukh.filter(isSuitProduct)

  console.log(`Mahrukh Ariqa store total products: ${allMahrukh.length}`)
  console.log(`Mahrukh Ariqa SUITS products: ${suits.length}\n`)
  console.log(JSON.stringify(suits, null, 2))
}

main().catch(console.error)
