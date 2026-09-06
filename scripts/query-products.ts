import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const ids = [
  '79c8759e-6d5f-4d0a-b214-ff27acd71c13',
  'e5fa7b9c-5445-4a50-ac61-0e04dd02fcad',
  '2f3985d3-cd25-41b6-a0ea-90b631d9ef37',
  '46c139b2-4855-4779-ab1d-334672e9594f',
  '2becf245-7f98-4c65-b82b-272d464554e6',
  '5d76bb5a-e715-48d2-a250-95db7b87e2e4',
  '126f2774-b899-4422-a0fc-d9dc98ee0487',
  '2a364aa3-f957-4814-902f-c1211c3b0f10',
  '1b0ddcd2-f529-4b35-af40-ebae5062fe33',
  'd05f2705-bff3-4545-9833-a9c492ff9530',
  '345e3299-606e-4058-aac4-2d4ffced16b5',
  'b66be7dd-eb2d-4bf0-839c-336aef4ca7eb',
  '6836a4e0-7dfa-492a-b64b-bf7435466623',
  'b2864dd1-f3b2-4a38-8aed-ce75e27f74da',
  '8c7795d2-4980-4f28-8721-f7e32d0c8293',
  '85d8542b-839b-4495-a1d1-de3d20086cbf',
  'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e',
  'a656cff3-cb72-4855-abfd-adc274e77b06',
  '43a0c6cf-d86f-490f-8f37-417e27e52855',
  '721f7049-1609-41ad-9f2b-9b7709b0b75e',
  '56b8fc72-236d-4ccd-97f3-77fe2bc2b351',
  '6f1daf7c-8394-4588-b3a9-db57ee888e51',
  '4a59d3f2-b653-4ee2-8599-b725a4fc2332',
  '022e4ea8-f413-4a73-9e00-f00922264974'
]

async function main() {
  const { data } = await supabase.from('products').select('id, name, user_id, store_id, status, sku').in('id', ids)
  console.log('Found:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
