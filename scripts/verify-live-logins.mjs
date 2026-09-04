// Verify both user logins show their correct store + products via the running dev server.

const BASE = 'http://localhost:3000'

async function loginAndFetch(email, password) {
  // Use Supabase's password grant endpoint directly with fetch
  const supabaseUrl = 'https://niewgxzvphwosfuwzggy.supabase.co'
  const supabaseAnon = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'

  const tokenRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnon,
      'Authorization': `Bearer ${supabaseAnon}`,
    },
    body: JSON.stringify({ email, password }),
  })
  const tokenJson = await tokenRes.json()
  if (!tokenRes.ok || !tokenJson.access_token) {
    console.error(`Login failed for ${email}:`, tokenJson)
    return null
  }

  const accessToken = tokenJson.access_token

  // Hit /api/store with the access token via cookies is complex; instead,
  // call Supabase directly with the user's JWT to query store/products and
  // simulate what /api/store does server-side.
  const sbHeaders = {
    apikey: supabaseAnon,
    Authorization: `Bearer ${accessToken}`,
  }
  const userId = tokenJson.user.id

  const storesRes = await fetch(
    `${supabaseUrl}/rest/v1/stores?user_id=eq.${userId}&select=*&order=created_at&limit=1`,
    { headers: sbHeaders }
  )
  const stores = await storesRes.json()
  if (!stores.length) {
    console.log(`(${email}) No store found for this user.`)
    return
  }
  const store = stores[0]
  console.log(`\n=== ${email} ===`)
  console.log(`Store: ${store.name} (slug=${store.slug}, id=${store.id})`)
  console.log(`Owner user_id: ${store.user_id}`)

  const productsRes = await fetch(
    `${supabaseUrl}/rest/v1/products?store_id=eq.${store.id}&status=eq.Active&select=id,name,sku,price,stock,image_url&order=created_at.desc`,
    { headers: sbHeaders }
  )
  const products = await productsRes.json()
  console.log(`Active products (${products.length}):`)
  for (const p of products) {
    console.log(`  - ${p.name} | sku=${p.sku} | price=$${p.price} | stock=${p.stock}`)
    console.log(`      image: ${p.image_url}`)
  }
}

async function main() {
  // Note: this assumes you know the passwords for these accounts.
  // If you don't have them, skip and just inspect the store mapping from
  // the service-role diagnostic instead.
  const users = [
    { email: 'mahrukhariqa@gmail.com', password: process.env.MAHRUKH_PASSWORD || '' },
    { email: 'sehrishtanzeel@gmail.com', password: process.env.SEHRISH_PASSWORD || '' },
  ]
  let ran = false
  for (const u of users) {
    if (!u.password) {
      console.log(`Skip ${u.email} (no password provided via env)`)
      continue
    }
    ran = true
    await loginAndFetch(u.email, u.password)
  }
  if (!ran) console.log('No passwords supplied — set MAHRUKH_PASSWORD / SEHRISH_PASSWORD env vars to test live logins.')
}

main().catch(e => { console.error(e); process.exit(1) })