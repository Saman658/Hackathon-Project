import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  // Step 1: Identify all stores and find Mahrukh Store
  const { data: stores, error: storesError } = await supabase
    .from('stores')
    .select('id, name, slug, user_id')
    .order('created_at', { ascending: true })

  if (storesError) {
    console.error('Error fetching stores:', storesError)
    return
  }

  console.log('=== ALL STORES ===')
  stores?.forEach(s => console.log(`  - ${s.name} (${s.slug}) user: ${s.user_id} id: ${s.id}`))

  // Find Mahrukh Store by name containing "Mahrukh"
  const mahrukhStore = stores?.find(s => s.name.toLowerCase().includes('mahrukh'))
  
  if (!mahrukhStore) {
    console.error('No Mahrukh store found!')
    return
  }

  console.log(`\n=== MAHRUKH STORE IDENTIFIED ===`)
  console.log(`Name: ${mahrukhStore.name}`)
  console.log(`Slug: ${mahrukhStore.slug}`)
  console.log(`ID: ${mahrukhStore.id}`)
  console.log(`Owner: ${mahrukhStore.user_id}`)

  const MAHRUKH_STORE_ID = mahrukhStore.id

  // Step 2: Check current products
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, sku, status')
    .eq('store_id', MAHRUKH_STORE_ID)

  console.log(`\nCurrent products in Mahrukh Store: ${existingProducts?.length || 0}`)
  existingProducts?.forEach(p => console.log(`  - ${p.name} (${p.sku}) status: ${p.status}`))

  // Step 3: Delete existing products if any
  if (existingProducts && existingProducts.length > 0) {
    console.log('\nDeleting existing products...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('store_id', MAHRUKH_STORE_ID)

    if (deleteError) {
      console.error('Error deleting products:', deleteError)
      return
    }
    console.log(`Deleted ${existingProducts.length} products.`)
  }

  // Step 4: Create 6 new products
  const newProducts = [
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: 'Ladies Suit',
      sku: 'MAHRUKH-LADIES-001',
      price: 65,
      stock: 50,
      image_url: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100',
      description: 'Elegant ladies suit crafted from premium fabric. Features modern design with traditional elegance, perfect for casual and formal occasions.',
      status: 'Active'
    },
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: 'Two Piece Suit',
      sku: 'MAHRUKH-TWO-001',
      price: 55,
      stock: 45,
      image_url: 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840',
      description: 'Stylish two piece suit combining comfort and fashion. Ideal for everyday wear with a sophisticated look.',
      status: 'Active'
    },
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: '3 Piece Lawn Suit',
      sku: 'MAHRUKH-LAWN-001',
      price: 85,
      stock: 30,
      image_url: 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445',
      description: 'Premium 3-piece lawn suit with unstitched design. Made from high-quality lawn fabric, perfect for summer wear with breathable comfort.',
      status: 'Active'
    },
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: 'Ladies Suit',
      sku: 'MAHRUKH-LADIES-002',
      price: 70,
      stock: 40,
      image_url: 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533',
      description: 'Beautiful ladies suit featuring premium fabric and elegant stitching. A must-have for any wardrobe seeking style and comfort.',
      status: 'Active'
    },
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: '3 Piece Grey Suit',
      sku: 'MAHRUKH-GREY-001',
      price: 95,
      stock: 25,
      image_url: 'https://pakistanpretwearcom.b-cdn.net/wp-content/uploads/2017/05/3-Piece-Grey-Ready-to-wear-Pakistani-Dress-is-available-online-at-a-discounted-sale-price-online-shopping-alkaram-spring-summer-festival-Eid-collection-2017-side-758x1137.jpg',
      description: 'Ready-to-wear 3-piece grey suit ideal for Eid and festive occasions. Features beautiful grey tones with delicate prints for a sophisticated look.',
      status: 'Active'
    },
    {
      user_id: mahrukhStore.user_id,
      store_id: MAHRUKH_STORE_ID,
      name: 'Ladies Cotton Suit',
      sku: 'MAHRUKH-COTTON-001',
      price: 50,
      stock: 60,
      image_url: 'https://www.ajmerafashion.com/uploaded-files/product-images/thumbs/Affordable-Ladies-Cotton-Suit-%E2%80%93-Budget-Friendly-Comfort-and-Style1-thumbs-600X825.jpg',
      description: 'Affordable ladies cotton suit offering budget-friendly comfort and style. Made from soft, breathable cotton fabric with all-over print design.',
      status: 'Active'
    }
  ]

  console.log('\n=== CREATING PRODUCTS ===')
  for (const product of newProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select('id, name, store_id, image_url')
      .single()

    if (error) {
      console.error(`Error creating ${product.name}:`, error)
    } else {
      console.log(`Created ${product.name}:`, data)
    }
  }

  // Step 5: Verify final state
  const { data: finalProducts } = await supabase
    .from('products')
    .select('id, name, sku, image_url, status')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  console.log(`\n=== FINAL VERIFICATION ===`)
  console.log(`Mahrukh Store (${MAHRUKH_STORE_ID}) products: ${finalProducts?.length || 0}`)
  finalProducts?.forEach(p => console.log(`  - ${p.name} (${p.sku})\n    image: ${p.image_url}\n    status: ${p.status}`))

  // Step 6: Verify Sehrish Store is untouched
  const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'
  const { data: sehrishProducts } = await supabase
    .from('products')
    .select('id, name')
    .eq('store_id', SEHRISH_STORE_ID)

  console.log(`\nSehrish Store products: ${sehrishProducts?.length || 0}`)
  if (sehrishProducts && sehrishProducts.length > 0) {
    sehrishProducts.forEach(p => console.log(`  - ${p.name}`))
  }
}

main().catch(console.error)
