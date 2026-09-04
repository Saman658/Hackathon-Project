// Simulate /api/store (the authenticated endpoint that loads after login)
// for each user, using each user's JWT. This proves that login as user A
// returns user A's store + user A's products (and never the other user's).

const SUPABASE_URL = 'https://niewgxzvphwosfuwzggy.supabase.co'
const SUPABASE_ANON = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'

const users = [
  {
    email: 'mahrukhariqa@gmail.com',
    expectedStoreName: 'Mahrukh Store',
    expectedUserPrefix: 'cf2fc82a',
    expectedStorePrefix: 'd465ed93',
  },
  {
    email: 'sehrishtanzeel@gmail.com',
    expectedStoreName: 'Sehrish Tanzeel Store',
    expectedUserPrefix: '7eb03ea7',
    expectedStorePrefix: 'd75917db',
  },
]

async function login(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
    body: JSON.stringify({ email, password }),
  })
  const json = await res.json()
  if (!res.ok) return null
  return json
}

async function fetchAsUser(accessToken, table, query) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return await res.json()
}

async function simulateApiStore(accessToken) {
  // Mirror /api/store/route.ts logic
  const stores = await fetchAsUser(
    accessToken,
    'stores',
    'select=*&order=created_at&limit=1'
  )
  if (!stores || !Array.isArray(stores) || stores.length === 0) {
    return { error: 'No store found' }
  }
  // The route also requires user_id match (server-side). For anon JWT this
  // means RLS will only return stores the user owns.
  const store = stores[0]
  const products = await fetchAsUser(
    accessToken,
    'products',
    `store_id=eq.${store.id}&status=eq.Active&order=created_at.desc&select=*`
  )
  return { store, products: products || [] }
}

async function runForUser(u, password) {
  console.log(`\n========== ${u.email} ==========`)
  const token = await login(u.email, password)
  if (!token) {
    console.log(`  Login failed (skip).`)
    return
  }
  const accessToken = token.access_token
  console.log(`  Logged in as user_id=${token.user.id}`)
  const result = await simulateApiStore(accessToken)
  if (result.error) {
    console.log(`  ${result.error}`)
    return
  }
  const store = result.store
  const products = result.products
  console.log(`  Store name:     "${store.name}"`)
  console.log(`  Store slug:     ${store.slug}`)
  console.log(`  Store id:       ${store.id}`)
  console.log(`  Store owner:    ${store.user_id}`)
  console.log(`  Products (${products.length}):`)
  for (const p of products) {
    console.log(`    - ${p.name}  [user=${p.user_id?.slice(0, 8)} store=${p.store_id?.slice(0, 8)} sku=${p.sku}]`)
    console.log(`        image: ${p.image_url}`)
  }
  // Asserts
  const okStoreName = store.name === u.expectedStoreName
  const okOwner = store.user_id?.slice(0, 8) === u.expectedUserPrefix
  const okStoreId = store.id?.slice(0, 8) === u.expectedStorePrefix
  console.log(`  [${okStoreName ? 'OK' : 'FAIL'}] store name matches expected`)
  console.log(`  [${okOwner ? 'OK' : 'FAIL'}] store owner matches expected user`)
  console.log(`  [${okStoreId ? 'OK' : 'FAIL'}] store id matches expected`)
  const allOwned = products.every(p => p.user_id === store.user_id)
  console.log(`  [${allOwned ? 'OK' : 'FAIL'}] every product's user_id == store owner`)
  const allInStore = products.every(p => p.store_id === store.id)
  console.log(`  [${allInStore ? 'OK' : 'FAIL'}] every product's store_id == store id`)
}

async function main() {
  const mahrukhPassword = process.env.MAHRUKH_PASSWORD
  const sehrishPassword = process.env.SEHRISH_PASSWORD
  if (!mahrukhPassword || !sehrishPassword) {
    console.log('Set MAHRUKH_PASSWORD and SEHRISH_PASSWORD env vars to run live login simulation.')
    return
  }
  await runForUser(users[0], mahrukhPassword)
  await runForUser(users[1], sehrishPassword)
}

main().catch(e => { console.error(e); process.exit(1) })