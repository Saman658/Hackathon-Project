import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const sehrish = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const mahrukh = 'd465ed93-a315-45d9-baab-617c2a577a6b'
  
  const { data: s } = await supabase.from('products').select('id, name, status').eq('store_id', sehrish).order('created_at', { ascending: true })
  const { data: m } = await supabase.from('products').select('id, name, status').eq('store_id', mahrukh).order('created_at', { ascending: true })
  
  console.log('SEHRISH:')
  s?.forEach((p, i) => console.log(`${i + 1}. ${p.name} | ${p.status}`))
  console.log('\nMAHRUKH:')
  m?.forEach((p, i) => console.log(`${i + 1}. ${p.name} | ${p.status}`))
}

main().catch(console.error)
