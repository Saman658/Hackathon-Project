import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  // 1) auth.users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  console.log('\n=== AUTH USERS ===')
  if (usersError) {
    console.error('usersError', usersError)
  } else {
    console.log(JSON.stringify(users.map(u => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      last_sign_in_at: u.last_sign_in_at,
      created_at: u.created_at,
    })), null, 2))
  }

  // 2) stores
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, user_id, slug, created_at')

  console.log('\n=== STORES (id, name, user_id) ===')
  if (storesError) {
    console.error('storesError', storesError)
  } else {
    console.log(JSON.stringify(stores, null, 2))
  }

  // 3) products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, image_url, price, stock, created_at')

  console.log('\n=== PRODUCTS (id, name, user_id, store_id, image) ===')
  if (productsError) {
    console.error('productsError', productsError)
  } else {
    console.log(JSON.stringify(products, null, 2))
  }

  // 4) profiles (to map user_id -> name if available)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')

  console.log('\n=== PROFILES ===')
  if (profilesError) {
    console.error('profilesError', profilesError)
  } else {
    console.log(JSON.stringify(profiles, null, 2))
  }
}

main()
