import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  try {
    const { data, error } = await supabase.rpc('get_products_schema')
    console.log('Schema:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.log('RPC error:', e)
  }

  try {
    const { data, error } = await supabase.from('products').select('*, deleted_at, is_deleted').limit(1)
    console.log('Extra columns test:', JSON.stringify(data, null, 2))
  } catch (e) {
    console.log('Extra columns error:', e)
  }
}

main().catch(console.error)
