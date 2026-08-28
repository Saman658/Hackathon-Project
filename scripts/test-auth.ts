import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const anonKey = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'

const supabase = createClient(url, anonKey)

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mahrukhariqa@gmail.com',
    password: 'testpassword'
  })
  
  console.log('signInWithPassword result:')
  console.log('error:', error)
  console.log('session:', data?.session ? 'present' : 'null')
  console.log('user:', data?.user ? { id: data.user.id, email: data.user.email } : 'null')
}

main().catch(console.error)
