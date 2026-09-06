import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const names = ['Add-on Pack', 'Classic Ladies Watch', 'Ladies Watch', 'Headphone', 'Headphones', 'Suit Piece', 'Baby Girl Shirt', 'Shoes', 'Frock', 'Ladies Dress', 'Ladies Shirt', 'Ladies Suit', 'Ladies Accessories']
  const { data, error } = await supabase.from('products').select('id, name, user_id, store_id, sku, price, stock, status, image_url').in('name', names)
  console.log('Error:', error)
  console.log('Found by name:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
