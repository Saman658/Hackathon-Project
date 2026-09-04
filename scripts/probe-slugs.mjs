// Probe exactly what /api/store/[slug] does
import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

async function probe(slug) {
  const { data, error } = await supabase.from('stores').select('*').eq('slug', slug).single()
  console.log(`slug=${slug}`)
  if (error) { console.log('  ERROR:', error.message, error.code, error.details); return }
  console.log('  FOUND:', data.name, data.slug, data.id)
}

async function main() {
  await probe('mahrukh-store')
  await probe('sehrish-tanzeel-store')
  await probe('mahrukh')
  await probe('Mahrukh-Store')
  await probe('MAHRUKH-STORE')
}
main().catch(console.error)