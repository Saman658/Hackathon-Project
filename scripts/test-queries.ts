import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const anonKey = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

async function main() {
  const amnaId = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
  const mahrukhId = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'

  // Test with anon client (simulates browser client with RLS)
  const anonClient = createClient(url, anonKey)
  
  // Test with service role client (bypasses RLS)
  const serviceClient = createClient(url, serviceKey)

  console.log('=== Testing with anon client (simulates browser) ===')
  
  // Simulate Amna's session
  const { data: amnaProductsAnon } = await anonClient
    .from('products')
    .select('id, name, user_id')
    .eq('user_id', amnaId)
  console.log('Amna products (anon):', amnaProductsAnon?.length || 0)

  // Simulate Mahrukh's session
  const { data: mahrukhProductsAnon } = await anonClient
    .from('products')
    .select('id, name, user_id')
    .eq('user_id', mahrukhId)
  console.log('Mahrukh products (anon):', mahrukhProductsAnon?.length || 0)

  // Test without user filter (what if RLS is disabled or bypassed?)
  const { data: allProductsAnon } = await anonClient
    .from('products')
    .select('id, name, user_id')
  console.log('All products (anon, no filter):', allProductsAnon?.length || 0)

  console.log('\n=== Testing with service role client (bypasses RLS) ===')
  
  const { data: amnaProductsService } = await serviceClient
    .from('products')
    .select('id, name, user_id')
    .eq('user_id', amnaId)
  console.log('Amna products (service):', amnaProductsService?.length || 0)

  const { data: mahrukhProductsService } = await serviceClient
    .from('products')
    .select('id, name, user_id')
    .eq('user_id', mahrukhId)
  console.log('Mahrukh products (service):', mahrukhProductsService?.length || 0)
}

main()
