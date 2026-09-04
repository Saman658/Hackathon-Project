import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const envPath = '.env.local'
const env = readFileSync(envPath, 'utf8')
const get = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'))
  return m ? m[1].trim() : undefined
}

const url = get('NEXT_PUBLIC_SUPABASE_URL')
const key = get('SUPABASE_SERVICE_ROLE_KEY')

console.log('URL:', url)
console.log('KEY length:', key?.length)

const supabase = createClient(url, key)

async function main() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', '%Digital Printed%')

  if (error) {
    console.error('ERROR:', error)
    return
  }

  console.log('=== MATCHING PRODUCTS (full row) ===')
  console.log(JSON.stringify(products, null, 2))

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, sku, image_url, store_id, created_at')
    .order('created_at', { ascending: true })

  console.log('\n=== ALL PRODUCTS (ordered by created_at asc) ===')
  console.log(JSON.stringify(allProducts, null, 2))
}
main().catch(e => console.error('FAIL', e))
