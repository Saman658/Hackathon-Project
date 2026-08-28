import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  // Get all auth users
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  
  console.log('\n=== AUTH USERS ===')
  if (usersError) {
    console.error('Error fetching users:', usersError)
  } else {
    console.log(JSON.stringify(users.users.map(u => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at
    })), null, 2))
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  console.log('\n=== PROFILES ===')
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  } else {
    console.log(JSON.stringify(profiles, null, 2))
  }

  // Get all stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('*')

  console.log('\n=== STORES ===')
  if (storesError) {
    console.error('Error fetching stores:', storesError)
  } else {
    console.log(JSON.stringify(stores, null, 2))
  }

  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')

  console.log('\n=== PRODUCTS ===')
  if (productsError) {
    console.error('Error fetching products:', productsError)
  } else {
    console.log(JSON.stringify(products, null, 2))
  }
}

main()
