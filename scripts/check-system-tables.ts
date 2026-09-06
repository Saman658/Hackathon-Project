import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  // Try to query pg_catalog or any audit tables
  const queries = [
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    "SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'public'",
  ]
  
  for (const q of queries) {
    const { data, error } = await supabase.rpc('exec_sql', { sql: q })
    console.log('Query:', q)
    console.log('Error:', error)
    console.log('Data:', JSON.stringify(data, null, 2))
  }
}

main().catch(console.error)
