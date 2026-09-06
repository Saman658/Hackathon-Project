import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const sehrishProductIds = [
    'a656cff3-cb72-4855-abfd-adc274e77b06',
    '43a0c6cf-d86f-490f-8f37-417e27e52855',
    '721f7049-1609-41ad-9f2b-9b7709b0b75e',
    '56b8fc72-236d-4ccd-97f3-77fe2bc2b351',
  ]

  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('id, product_id, product_name, order_id')
    .in('product_id', sehrishProductIds)

  console.log('Order items referencing Sehrish products:', JSON.stringify(orderItems, null, 2))
  console.log('Count:', orderItems?.length || 0)
}

main().catch(console.error)
