import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  const { data: orders } = await supabase.from('orders').select('*')
  console.log('\n=== ORDERS ===')
  console.log(JSON.stringify(orders, null, 2))

  const { data: orderItems } = await supabase.from('order_items').select('*')
  console.log('\n=== ORDER_ITEMS ===')
  console.log(JSON.stringify(orderItems, null, 2))
}

main()
