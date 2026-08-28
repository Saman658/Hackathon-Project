import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const { data: { users } } = await supabase.auth.admin.listUsers()
  console.log('AUTH USERS:', JSON.stringify(users.map(u => ({ id: u.id, email: u.email, confirmed: !!u.email_confirmed_at })), null, 2))

  const { data: profiles } = await supabase.from('profiles').select('*')
  console.log('\nPROFILES:', JSON.stringify(profiles, null, 2))
}

main().catch(console.error)
