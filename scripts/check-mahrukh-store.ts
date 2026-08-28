import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const storeSlug = 'mahrukh-store'
  
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', storeSlug)
    .single()

  if (!store) {
    console.log('Store not found!')
    return
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', store.id)
    .eq('status', 'Active')
    .order('created_at', { ascending: false })

  console.log(`=== Mahrukh Store (/${storeSlug}) ===`)
  console.log(`Products count: ${products?.length || 0}`)
  products?.forEach(p => {
    console.log(`  - ${p.name} (${p.sku}) - $${p.price} - stock: ${p.stock}`)
    console.log(`    desc: ${p.description?.substring(0, 80)}`)
    console.log(`    image: ${p.image_url}`)
    console.log(`    category from name: ${getProductCategory(p.name)}`)
  })
}

function getProductCategory(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes("frock")) return "frocks"
  if (n.includes("ladies suit") || n.includes("suit")) return "ladies-suits"
  if (n.includes("ladies shirt") || n.includes("shirt")) return "ladies-shirts"
  return null
}

main().catch(console.error)
