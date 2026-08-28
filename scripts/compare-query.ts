import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const anonKey = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'

async function main() {
  const serviceSupabase = createClient(url, serviceKey)
  const anonSupabase = createClient(url, anonKey)

  const { data: serviceProducts } = await serviceSupabase.from('products').select('*')
  const { data: anonProducts } = await anonSupabase.from('products').select('*')

  console.log('Service role products count:', serviceProducts?.length || 0)
  console.log('Anon products count:', anonProducts?.length || 0)
  console.log('Service role products:', JSON.stringify(serviceProducts?.map(p => p.name), null, 2))
  console.log('Anon products:', JSON.stringify(anonProducts?.map(p => p.name), null, 2))
}

main().catch(console.error)
