import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const SEHRISH_USER_ID = '7eb03ea7-0282-458b-a9f9-acbf9fb9ed23'
const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  // ===== Step 1: Verify store ownership =====
  console.log('=== Verifying store ownership ===')
  const { data: sehrishCheck, error: seErr } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', SEHRISH_STORE_ID)
    .eq('user_id', SEHRISH_USER_ID)
    .single()
  if (seErr || !sehrishCheck) {
    console.error('ABORT: Sehrish store ownership check failed')
    return
  }
  console.log(`OK: Sehrish store "${sehrishCheck.name}" owned by ${SEHRISH_USER_ID}`)

  const { data: mahrukhCheck, error: meErr } = await supabase
    .from('stores')
    .select('id, user_id, name, slug')
    .eq('id', MAHRUKH_STORE_ID)
    .eq('user_id', MAHRUKH_USER_ID)
    .single()
  if (meErr || !mahrukhCheck) {
    console.error('ABORT: Mahrukh store ownership check failed')
    return
  }
  console.log(`OK: Mahrukh store "${mahrukhCheck.name}" owned by ${MAHRUKH_USER_ID}`)

  // ===== Step 2: Fix Sehrish profile name (currently mislabeled "Mahrukh ariqa") =====
  console.log('\n=== Fixing profile names ===')
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ name: 'Sehrish', business_name: 'Sehrish Tanzeel Store' })
    .eq('id', SEHRISH_USER_ID)
  if (profileErr) console.error('Sehrish profile error:', profileErr)
  else console.log('Sehrish profile updated to name=Sehrish')

  // ===== Step 3: Move Frock from Sehrish to Mahrukh (correct ownership) =====
  console.log('\n=== Moving Frock from Sehrish to Mahrukh ===')
  const FROCK_ID = '2a364aa3-f957-4814-902f-c1211c3b0f10'
  const { data: frockBefore, error: frockFetchErr } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku')
    .eq('id', FROCK_ID)
    .single()
  if (frockFetchErr || !frockBefore) {
    console.error('ABORT: Frock product not found')
    return
  }
  console.log(`Frock before: user=${frockBefore.user_id.slice(0, 8)} store=${frockBefore.store_id.slice(0, 8)} sku=${frockBefore.sku}`)

  const { data: frockAfter, error: frockUpdateErr } = await supabase
    .from('products')
    .update({ user_id: MAHRUKH_USER_ID, store_id: MAHRUKH_STORE_ID, sku: 'MAHRUKH-FROCK-001' })
    .eq('id', FROCK_ID)
    .select('id, name, user_id, store_id, sku')
    .single()
  if (frockUpdateErr) {
    console.error('Error moving Frock:', frockUpdateErr)
    return
  }
  console.log(`Frock after: user=${frockAfter.user_id.slice(0, 8)} store=${frockAfter.store_id.slice(0, 8)} sku=${frockAfter.sku}`)

  // ===== Step 4: Update Mahrukh product descriptions to be ladies suit descriptions =====
  console.log('\n=== Updating Mahrukh product descriptions (keep names as-is) ===')
  const mahrukhDescriptionUpdates = [
    {
      id: '1b0ddcd2-f529-4b35-af40-ebae5062fe33', // Ladies Suit
      description: 'Elegant ladies suit featuring a refined silhouette and premium tailoring. Crafted from breathable fabric for all-day comfort, perfect for both formal events and everyday elegance. Includes coordinated top and bottom for a complete polished look.',
    },
    {
      id: 'd05f2705-bff3-4545-9833-a9c492ff9530', // Ladies Shirt
      description: 'Stylish ladies suit shirt tailored for a flattering fit. Made with high-grade stitching and soft, durable fabric. A versatile piece that pairs perfectly as part of a ladies suit ensemble or as an elegant standalone top.',
    },
    {
      id: '345e3299-606e-4058-aac4-2d4ffced16b5', // Ladies Accessories
      description: 'Complete ladies suit finishing accessories — includes matching accents that elevate any suit outfit. Carefully curated pieces with premium craftsmanship to add a polished, coordinated touch to your ladies suit look.',
    },
  ]
  for (const upd of mahrukhDescriptionUpdates) {
    const { error } = await supabase
      .from('products')
      .update({ description: upd.description })
      .eq('id', upd.id)
      .eq('store_id', MAHRUKH_STORE_ID)
    if (error) console.error(`Error updating description for ${upd.id}:`, error)
    else console.log(`Updated description for product ${upd.id}`)
  }

  // ===== Step 5: Restore original real image URLs for Sehrish products =====
  console.log('\n=== Restoring original real image URLs for Sehrish products ===')
  const sehrishImageRestores = [
    {
      id: '46c139b2-4855-4779-ab1d-334672e9594f', // Headphone
      name: 'Headphone',
      image_url: 'https://w0.peakpx.com/wallpaper/73/599/HD-wallpaper-wireless-headphones-with-yellow-background.jpg',
      source: 'scripts/update-product-images.ts (original Google-found URL)',
    },
    {
      id: '126f2774-b899-4422-a0fc-d9dc98ee0487', // Suit Piece (current DB id)
      name: 'Suit Piece',
      image_url: 'https://www.hussainitextileshop.com/wp-content/uploads/2024/03/DA1191-BLACK-RS-36990-02_1024x1024.webp',
      source: 'scripts/update-product-images.ts (original Google-found URL)',
    },
    {
      id: '2becf245-7f98-4c65-b82b-272d464554e6', // Baby Girl Shirt
      name: 'Baby Girl Shirt',
      image_url: 'https://static.vecteezy.com/system/resources/thumbnails/054/627/284/small_2x/pink-kids-t-shirt-perfect-for-valentine-s-day-photo.jpeg',
      source: 'scripts/update-product-images.ts (original Google-found URL)',
    },
    {
      id: '5d76bb5a-e715-48d2-a250-95db7b87e2e4', // Shoes
      name: 'Shoes',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D',
      source: 'scripts/update-product-images.ts (original Google-found URL)',
    },
    {
      id: '79c8759e-6d5f-4d0a-b214-ff27acd71c13', // Add-on Pack — restore original local real photo
      name: 'Add-on Pack',
      image_url: '/products/add-on-pack.jpg',
      source: 'public/products/add-on-pack.jpg (real product image file in repo)',
    },
    {
      id: 'e5fa7b9c-5445-4a50-ac61-0e04dd02fcad', // Ladies Watch — restore original local real photo
      name: 'Ladies Watch',
      image_url: '/products/classic-ladies-watch.jpg',
      source: 'public/products/classic-ladies-watch.jpg (real product image file in repo; same path as migration 20260824)',
    },
  ]
  for (const item of sehrishImageRestores) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: item.image_url })
      .eq('id', item.id)
      .eq('store_id', SEHRISH_STORE_ID)
      .select('id, name, image_url')
      .single()
    if (error) console.error(`Error restoring image for ${item.name}:`, error)
    else console.log(`Restored ${item.name}: ${data?.image_url}`)
  }

  // ===== Step 6: Verification =====
  console.log('\n=== FINAL VERIFICATION ===')

  const { data: profiles } = await supabase.from('profiles').select('id, name, business_name, email').order('email')
  console.log('\nProfiles:')
  for (const p of profiles || []) {
    console.log(`  ${p.name || '(no name)'} | business=${p.business_name || '(none)'} | email=${p.email}`)
  }

  const { data: stores } = await supabase.from('stores').select('id, user_id, name, slug').order('created_at')
  console.log('\nStores:')
  for (const s of stores || []) {
    console.log(`  ${s.name} (slug=${s.slug}) owner=${s.user_id.slice(0, 8)}... id=${s.id.slice(0, 8)}...`)
  }

  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, user_id, store_id, sku, status, image_url, description')
    .order('created_at')
  const sehrishProds = (allProducts || []).filter(p => p.store_id === SEHRISH_STORE_ID)
  const mahrukhProds = (allProducts || []).filter(p => p.store_id === MAHRUKH_STORE_ID)

  console.log(`\nSehrish Store (${sehrishProds.length} products):`)
  for (const p of sehrishProds) {
    const ownerOk = p.user_id === SEHRISH_USER_ID
    console.log(`  - ${p.name} [sku=${p.sku}] [user=${p.user_id.slice(0, 8)}] ${ownerOk ? '✓' : '✗ WRONG OWNER'}`)
    console.log(`      image: ${p.image_url}`)
  }
  console.log(`\nMahrukh Store (${mahrukhProds.length} products):`)
  for (const p of mahrukhProds) {
    const ownerOk = p.user_id === MAHRUKH_USER_ID
    console.log(`  - ${p.name} [sku=${p.sku}] [user=${p.user_id.slice(0, 8)}] ${ownerOk ? '✓' : '✗ WRONG OWNER'}`)
    console.log(`      image: ${p.image_url}`)
    console.log(`      desc: ${p.description?.slice(0, 80)}...`)
  }

  const cross = sehrishProds.filter(p => p.user_id !== SEHRISH_USER_ID).length +
                 mahrukhProds.filter(p => p.user_id !== MAHRUKH_USER_ID).length
  console.log(`\nCross-store ownership issues: ${cross}`)
}

main().catch(e => { console.error(e); process.exit(1) })