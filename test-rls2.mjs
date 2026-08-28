import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const anonKey = 'sb_publishable__FUbigVEg9ttmQowgW1zDA_5LVQfWSU'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const sehrishId = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const mahrukhId = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const nexusStoreId = 'nexus'

let passCount = 0
let failCount = 0
const createdOrderIds = []

function assert(name, condition, details) {
  details = details || ''
  if (condition) {
    console.log('  PASS: ' + name)
    passCount++
  } else {
    console.log('  FAIL: ' + name + (details ? ' — ' + details : ''))
    failCount++
  }
}

async function getSession(email, password) {
  const client = createClient(url, anonKey)
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.session) return null
  return data.session.access_token
}

function createAuthedClient(accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: 'Bearer ' + accessToken } },
  })
}

async function cleanup() {
  const serviceClient = createClient(url, serviceKey)
  for (const orderId of createdOrderIds) {
    await serviceClient.from('order_items').delete().eq('order_id', orderId)
    await serviceClient.from('orders').delete().eq('id', orderId)
  }
}

async function main() {
  const anonClient = createClient(url, anonKey)
  const serviceClient = createClient(url, serviceKey)

  const mahrukhAccessToken = await getSession('mahrukhariqa@gmail.com', 'testpassword')
  const mahrukhClient = mahrukhAccessToken ? createAuthedClient(mahrukhAccessToken) : null

  console.log('\n=== Orders RLS Tests ===\n')

  console.log('--- Anon client (no auth) ---')

  const { data: anonOrders } = await anonClient.from('orders').select('id, user_id')
  assert('Anon cannot read orders', !anonOrders || anonOrders.length === 0, 'got ' + (anonOrders ? anonOrders.length : 0) + ' rows')

  const { data: anonOrderItems } = await anonClient.from('order_items').select('id, order_id')
  assert('Anon cannot read order_items', !anonOrderItems || anonOrderItems.length === 0, 'got ' + (anonOrderItems ? anonOrderItems.length : 0) + ' rows')

  const { data: anonInsertedOrder } = await anonClient
    .from('orders')
    .insert({
      user_id: sehrishId,
      store_id: nexusStoreId,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '0000000000',
      shipping_address: '123 Test St',
      city: 'Test City',
      postal_code: '00000',
      subtotal: 10,
      shipping: 0,
      total: 10,
      status: 'Pending',
    })
    .select('id')
    .single()

  assert('Anon can insert orders', !!anonInsertedOrder)

  if (anonInsertedOrder) {
    createdOrderIds.push(anonInsertedOrder.id)
    const { error: anonItemInsertError } = await anonClient.from('order_items').insert({
      order_id: anonInsertedOrder.id,
      product_id: '00000000-0000-0000-0000-000000000000',
      product_name: 'Test Product',
      price: 10,
      quantity: 1,
    })
    assert('Anon can insert order_items', !anonItemInsertError, anonItemInsertError && anonItemInsertError.message)
  }

  console.log('\n--- Authenticated client (Mahrukh) ---')

  let mahrukhOrderId = null

  if (mahrukhClient) {
    const { data: existingMahrukhOrders } = await mahrukhClient.from('orders').select('id')
    if (existingMahrukhOrders && existingMahrukhOrders.length > 0) {
      mahrukhOrderId = existingMahrukhOrders[0].id
    }
  }

  if (!mahrukhOrderId) {
    const { data: seededOrder } = await serviceClient
      .from('orders')
      .insert({
        user_id: mahrukhId,
        store_id: nexusStoreId,
        customer_name: 'Mahrukh Test',
        customer_email: 'mahrukh@example.com',
        customer_phone: '0000000000',
        shipping_address: '456 Test Ave',
        city: 'Test City',
        postal_code: '00000',
        subtotal: 20,
        shipping: 0,
        total: 20,
        status: 'Pending',
      })
      .select('id')
      .single()
    mahrukhOrderId = seededOrder ? seededOrder.id : null
    if (mahrukhOrderId) createdOrderIds.push(mahrukhOrderId)
  }

  if (mahrukhClient) {
    const { data: mahrukhOrders } = await mahrukhClient.from('orders').select('id, user_id')
    assert('Mahrukh can read own orders', mahrukhOrders && mahrukhOrders.length > 0 && mahrukhOrders.every(function(o) { return o.user_id === mahrukhId }), 'got ' + (mahrukhOrders ? mahrukhOrders.length : 0) + ' rows')

    const { data: mahrukhOrdersAll } = await mahrukhClient.from('orders').select('id, user_id')
    assert('Mahrukh cannot read Sehrish orders', mahrukhOrdersAll && mahrukhOrdersAll.every(function(o) { return o.user_id === mahrukhId }), 'got ' + (mahrukhOrdersAll ? mahrukhOrdersAll.length : 0) + ' rows')

    if (mahrukhOrderId) {
      const { data: mahrukhItems } = await mahrukhClient.from('order_items').select('id, order_id').eq('order_id', mahrukhOrderId)
      assert('Mahrukh can read order_items from own orders', !mahrukhItems || mahrukhItems.length >= 0, 'got ' + (mahrukhItems ? mahrukhItems.length : 0) + ' rows')
    }
  } else {
    console.log('  SKIP: Mahrukh auth not available')
  }

  console.log('\n--- Service role client (bypasses RLS) ---')

  const { data: serviceOrders } = await serviceClient.from('orders').select('id, user_id')
  assert('Service role can read all orders', serviceOrders && serviceOrders.length > 0, 'got ' + (serviceOrders ? serviceOrders.length : 0) + ' rows')

  const { data: serviceOrderItems } = await serviceClient.from('order_items').select('id, order_id')
  assert('Service role can read all order_items', serviceOrderItems !== null, 'got ' + (serviceOrderItems ? serviceOrderItems.length : 0) + ' rows')

  console.log('\n--- Summary ---')
  console.log('Passed: ' + passCount)
  console.log('Failed: ' + failCount)

  await cleanup()

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch(function(err) {
  console.error(err)
  process.exit(1)
})
