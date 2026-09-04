import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

const MAHRUKH_USER_ID = 'cf2fc82a-790a-4fc7-8dae-2728ceae8ad1'
const MAHRUKH_STORE_ID = 'd465ed93-a315-45d9-baab-617c2a577a6b'

async function main() {
  console.log('=== Removing old Mahrukh Store products ===')

  const oldProductIds = [
    '1b0ddcd2-f529-4b35-af40-ebae5062fe33', // Ladies Suit
    'd05f2705-bff3-4545-9833-a9c492ff9530', // Ladies Shirt
    '2a364aa3-f957-4814-902f-c1211c3b0f10', // Frock
  ]

  for (const id of oldProductIds) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('store_id', MAHRUKH_STORE_ID)
    if (error) {
      console.error(`Failed to delete product ${id}:`, error)
    } else {
      console.log(`Deleted product ${id}`)
    }
  }

  console.log('\n=== Adding new Mahrukh Store products ===')

  const newProducts = [
    {
      name: 'Digital Printed Lawn 2-Piece Suite',
      sku: 'MAHRUKH-LAWN-001',
      image_url: 'https://shoprex.com/images/srproducts/large/digital-printed-lawn-shirt-with-trouser-2-pec-suite-unstitched-drl-1388_46536.jpg',
      price: 89.00,
      stock: 50,
      status: 'Active',
      description: 'Digital printed lawn fabric 2-piece unstitched suit featuring a shirt with trouser. Crafted from premium breathable lawn fabric with all-over digital print on front, back, sleeves and daman. Perfect for spring and summer wear, offering comfort and elegance for casual and semi-formal occasions.',
    },
    {
      name: 'Chevron 2 Piece Ladies Suit',
      sku: 'MAHRUKH-CHEVRON-001',
      image_url: 'https://beyonddetail.pk/cdn/shop/files/ChatGPTImageMar24_2026_09_32_49PM.png?v=1774376500',
      price: 59.99,
      stock: 30,
      status: 'Active',
      description: 'Stylish all-over chevron print 2-piece stitched ladies suit. Made with high-quality China imported poly cotton fabric featuring premium sublimation printing for vibrant, fade-resistant colors. Soft, breathable, and lightweight with a comfortable fit. Perfect for casual wear, office, shopping, family gatherings, and semi-formal occasions.',
    },
    {
      name: 'Hamza Ismail 3PC Printed Lawn Suit',
      sku: 'MAHRUKH-HAMZA-001',
      image_url: 'https://dilkash.com.pk/wp-content/uploads/2026/04/3PC-Unstitched-Printed-Lawn-Suit-–-DFC013-300x450.webp',
      price: 42.50,
      stock: 25,
      status: 'Active',
      description: 'Premium 3-piece unstitched printed lawn suit from the Hamza Ismail collection. Features elegant digital prints on high-quality lawn fabric. Includes shirt, trouser, and dupatta for a complete outfit. Designed for summer wear with beautiful patterns, comfortable fit, and refined tailoring suitable for everyday elegance and special occasions.',
    },
  ]

  for (const product of newProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: MAHRUKH_USER_ID,
        store_id: MAHRUKH_STORE_ID,
        name: product.name,
        sku: product.sku,
        image_url: product.image_url,
        price: product.price,
        stock: product.stock,
        status: product.status,
        description: product.description,
      })
      .select('id, name, sku, price, stock, status, image_url')
      .single()

    if (error) {
      console.error(`Failed to insert product ${product.name}:`, error)
    } else {
      console.log(`Inserted: ${data.name} [sku=${data.sku}] price=$${data.price} stock=${data.stock}`)
    }
  }

  console.log('\n=== Verification ===')
  const { data: finalProducts } = await supabase
    .from('products')
    .select('id, name, sku, price, stock, status, image_url, description')
    .eq('store_id', MAHRUKH_STORE_ID)
    .order('created_at', { ascending: false })

  console.log(`\nMahrukh Store (${finalProducts?.length || 0} products):`)
  for (const p of finalProducts || []) {
    console.log(`  - ${p.name} [sku=${p.sku}] price=$${p.price} stock=${p.stock} status=${p.status}`)
    console.log(`    image: ${p.image_url}`)
    console.log(`    desc: ${p.description?.slice(0, 100)}...`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
