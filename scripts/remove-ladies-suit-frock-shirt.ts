import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

async function main() {
  // VERIFY store_id ownership before any delete
  const { data: storeCheck, error: storeCheckError } = await supabase
    .from('stores')
    .select('id, user_id, name')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()

  if (storeCheckError || !storeCheck) {
    console.error(`ABORT: Store ${SEHRISH_STORE_ID} is NOT owned by user ${SEHRISH_USER_ID}.`)
    console.error('No products were deleted.')
    return
  }
  console.log(`Verified: ${storeCheck.name} owned by user ${SEHRISH_USER_ID}`)

  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, status')
    .eq('store_id', SEHRISH_STORE_ID)
    .order('created_at', { ascending: true })

  console.log('All Sehrish products:')
  products?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} | category: ${p.category || 'none'} | status: ${p.status}`)
  })

  const targets = products?.filter(p => {
    const n = p.name.toLowerCase()
    const c = (p.category || '').toLowerCase()
    return (
      n.includes('ladies suit') ||
      n.includes('frock') ||
      n.includes('ladies shirt') ||
      c.includes('ladies-suits') ||
      c.includes('frocks') ||
      c.includes('ladies-shirts')
    )
  }) || []

  console.log('\nMatching products to remove:')
  targets.forEach(p => console.log(`  - ${p.name} (${p.id})`))

  for (const p of targets) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', p.id)
      .eq('store_id', SEHRISH_STORE_ID)

    if (error) {
      console.error(`Error deleting ${p.name}:`, error.message)
    } else {
      console.log(`Deleted: ${p.name}`)
    }
  }

  const { data: remaining } = await supabase
    .from('products')
    .select('id, name, category, status')
    .eq('store_id', SEHRISH_STORE_ID)
    .order('created_at', { ascending: true })

  console.log('\nRemaining Sehrish products:')
  remaining?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} | category: ${p.category || 'none'} | status: ${p.status}`)
  })
}

main().catch(console.error)
