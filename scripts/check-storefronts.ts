import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const stores = [
    { slug: 'sehrish-tanzeel-store', name: 'Sehrish Tanzeel Store' },
    { slug: 'mahrukh-store', name: 'Mahrukh Store' },
  ]

  for (const storeInfo of stores) {
    console.log(`\n=== ${storeInfo.name} (/${storeInfo.slug}) ===`)
    
    const { data: store } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', storeInfo.slug)
      .single()

    if (!store) {
      console.log('Store not found!')
      continue
    }

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('status', 'Active')
      .order('created_at', { ascending: false })

    console.log(`Products count: ${products?.length || 0}`)
    products?.forEach(p => {
      console.log(`  - ${p.name} (${p.sku}) - $${p.price} - stock: ${p.stock}`)
      console.log(`    desc: ${p.description?.substring(0, 60)}...`)
      console.log(`    image: ${p.image_url}`)
    })
  }
}

main().catch(console.error)
