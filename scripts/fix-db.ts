import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  // Current state:
  // User 1 (Mahrukh): 7eb03ea7-0282-458b-a9f9-acbf9fb9ed23
  //   Store: d75917db-b09b-4e7a-acb8-9cfb0ac32df9
  // User 2 (Sehrish): cf2fc82a-790a-4fc7-8dae-2728ceae8ad1
  //   Store: d465ed93-a315-45d9-baab-617c2a577a6b
  
  // All 6 products currently belong to User 1 (Amna).
  // We need to split them: 3 for User 1, 3 for User 2.
  
  const productsToMoveToMahrukh = [
    { id: '8c7795d2-4980-4f28-8721-f7e32d0c8293', name: 'Shoes' },
    { id: '85d8542b-839b-4495-a1d1-de3d20086cbf', name: 'Dress Shirt' },
    { id: 'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e', name: 'Headphones' },
  ]

  const mahrukhUserId = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
  const mahrukhStoreId = 'd465ed93-a315-45d9-baab-617c2a577a6b'

  for (const product of productsToMoveToMahrukh) {
    const { data, error } = await supabase
      .from('products')
      .update({ user_id: mahrukhUserId, store_id: mahrukhStoreId })
      .eq('id', product.id)
      .select('id, name, user_id, store_id')
      .single()

    if (error) {
      console.error(`Error updating ${product.name}:`, error)
    } else {
      console.log(`Updated ${product.name}:`, data)
    }
  }

  // Verify the final state
  const { data: allProducts } = await supabase.from('products').select('id, name, user_id, store_id').order('created_at', { ascending: true })
  console.log('\n=== FINAL PRODUCTS ===')
  console.log(JSON.stringify(allProducts, null, 2))
}

main()
