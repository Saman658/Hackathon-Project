import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

function getProductCategory(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes("frock") || n.includes("dress")) return "frocks"
  if (n.includes("ladies suit") || n.includes("suit")) return "ladies-suits"
  if (n.includes("ladies shirt") || n.includes("shirt")) return "ladies-shirts"
  return null
}

async function main() {
  const products = [
    'Add-on Pack', 'Suit Piece', 'Classic Ladies Watch',
    'Ladies Dress', 'Ladies Shirt', 'Ladies Suit'
  ]

  console.log('Product categories after fix:')
  products.forEach(name => {
    console.log(`  ${name} -> ${getProductCategory(name)}`)
  })
}

main()
