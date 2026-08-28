import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function main() {
  const idsToCheck = [
    '8c7795d2-4980-4f28-8721-f7e32d0c8293',
    '85d8542b-839b-4495-a1d1-de3d20086cbf',
    'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e',
    'b66be7dd-eb2d-4bf0-839c-336aef4ca7eb',
    '6836a4e0-7dfa-492a-b64b-bf7435466623',
    'b2864dd1-f3b2-4a38-8aed-ce75e27f74da',
  ]

  const { data } = await supabase.from('products').select('*').in('id', idsToCheck)
  console.log('Found historical products:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
