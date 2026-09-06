import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  const updates = [
    {
      id: '6f1daf7c-8394-4588-b3a9-db57ee888e51',
      name: 'Digital Printed 3-Piece Suit',
      image_url: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_10_21_11PM.png?v=1775911071&width=1100',
      description: 'Exquisite digital printed 3-piece suit crafted from premium lawn fabric. Features intricate patterns and vibrant colors, perfect for summer wear. Includes shirt, dupatta, and trouser for a complete elegant look.'
    },
    {
      id: '4a59d3f2-b653-4ee2-8599-b725a4fc2332',
      name: 'Chevron 3-Piece Ladies Suit',
      image_url: 'https://www.limelight.pk/cdn/shop/files/U4923SU-3PC-227-3PieceLawnSuit_Unstitched_3.jpg?v=1783404694&width=1445',
      description: 'Sophisticated chevron patterned 3-piece ladies suit made from high-quality lawn material. Unstitched design allows custom tailoring. The chevron pattern adds a modern geometric touch to traditional elegance.'
    },
    {
      id: '022e4ea8-f413-4a73-9e00-f00922264974',
      name: 'Hamza Ismail 3PC Printed Lawn Suit',
      image_url: 'https://pakistanpretwearcom.b-cdn.net/wp-content/uploads/2017/05/3-Piece-Grey-Ready-to-wear-Pakistani-Dress-is-available-online-at-a-discounted-sale-price-online-shopping-alkaram-spring-summer-festival-Eid-collection-2017-side-758x1137.jpg',
      description: 'Premium Hamza Ismail 3-piece printed lawn suit, a ready-to-wear Pakistani dress ideal for Eid and festive occasions. Features beautiful grey tones with delicate prints, offering ready-to-wear convenience with traditional style.'
    },
    {
      id: '0dae06e3-58d0-44bd-bfa9-eaced9ddbe19',
      name: 'All-Over Print Premium Cotton T-Shirt',
      image_url: 'https://www.ajmerafashion.com/uploaded-files/product-images/thumbs/Affordable-Ladies-Cotton-Suit-%E2%80%93-Budget-Friendly-Comfort-and-Style1-thumbs-600X825.jpg',
      description: 'Affordable ladies cotton suit offering budget-friendly comfort and style. Made from soft, breathable cotton fabric with all-over print design. Perfect for casual daily wear, combining comfort with contemporary fashion at an unbeatable price.'
    }
  ]

  const newProducts = [
    {
      user_id: 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1',
      store_id: MAHRUKH_STORE_ID,
      name: 'Premium Printed Lawn Suit',
      sku: 'MAHRUKH-LAWN-002',
      price: 75,
      stock: 40,
      image_url: 'https://afiay.com/cdn/shop/files/Price6700t.png?v=1786286662&width=3840',
      description: 'Premium printed lawn suit with exclusive design and superior fabric quality. Perfect for summer occasions, offering comfort and style in one elegant package.',
      status: 'Active'
    },
    {
      user_id: 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1',
      store_id: MAHRUKH_STORE_ID,
      name: 'Designer Cotton Suit',
      sku: 'MAHRUKH-COTTON-001',
      price: 55,
      stock: 60,
      image_url: 'https://miandadfabrics.com/cdn/shop/files/1_661b7bd6-c327-49e0-a48c-01b37b8413e4.jpg?v=1784874932&width=533',
      description: 'Designer cotton suit featuring premium quality fabric and modern cuts. Breathable material ensures all-day comfort while the elegant design keeps you stylish.',
      status: 'Active'
    }
  ]

  for (const product of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        image_url: product.image_url,
        description: product.description,
      })
      .eq('id', product.id)
      .eq('store_id', MAHRUKH_STORE_ID)
      .select('id, name, image_url, store_id')
      .single()

    if (error) {
      console.error(`Error updating ${product.name}:`, error)
    } else {
      console.log(`Updated ${product.name}:`, data)
    }
  }

  for (const product of newProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select('id, name, store_id')
      .single()

    if (error) {
      console.error(`Error creating ${product.name}:`, error)
    } else {
      console.log(`Created ${product.name}:`, data)
    }
  }

  // Verify
  const { data: products } = await supabase
    .from('products')
    .select('id, name, image_url, store_id')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: true })

  console.log('\n=== Mahrukh Store Products ===')
  products?.forEach(p => console.log(`  - ${p.name}\n    image: ${p.image_url}`))
}

main().catch(console.error)
