import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'

const supabase = createClient(url, key)

async function main() {
  // Fix Sehrish's store name (currently named "Amna Store" which is wrong)
  const { data: updatedStore, error: storeError } = await supabase
    .from('stores')
    .update({
      name: 'Sehrish Store',
      slug: 'sehrish-store',
      hero_title: 'Sehrish Store',
      hero_description: 'Discover amazing products from Sehrish Store.',
    })
    .eq('id', 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9')
    .select('id, name, slug')
    .single()

  if (storeError) {
    console.error('Error updating Sehrish store:', storeError)
  } else {
    console.log('Updated Sehrish store:', updatedStore)
  }

  // Update Mahrukh's products to be women's fashion items
  // These must have completely different images from Sehrish's products
  const mahrukhProducts = [
    {
      id: '8c7795d2-4980-4f28-8721-f7e32d0c8293',
      name: 'Ladies Suit',
      description: 'Elegant ladies suit crafted for special occasions and everyday elegance. Premium fabric with modern tailoring.',
      sku: 'LADY-SUIT-001',
      price: 89,
      stock: 50,
      image_url: '/products/basic-plan.jpg',
    },
    {
      id: '85d8542b-839b-4495-a1d1-de3d20086cbf',
      name: 'Ladies Shirt',
      description: 'Stylish ladies shirt designed for comfort and fashion. A versatile addition to any wardrobe.',
      sku: 'LADY-SHIRT-001',
      price: 45,
      stock: 100,
      image_url: '/products/enterprise-plan.jpg',
    },
    {
      id: 'd9e7a1d5-bee1-43de-b8a7-d29b5a094e1e',
      name: 'Ladies Accessories',
      description: 'Complete your look with our curated ladies accessories collection. Trendy and timeless pieces.',
      sku: 'LADY-ACC-001',
      price: 25,
      stock: 200,
      image_url: '/products/legacy-support.jpg',
    },
  ]

  for (const product of mahrukhProducts) {
    const { data, error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        image_url: product.image_url,
        status: 'Active',
      })
      .eq('id', product.id)
      .select('id, name, user_id, store_id, image_url')
      .single()

    if (error) {
      console.error(`Error updating ${product.name}:`, error)
    } else {
      console.log(`Updated ${product.name}:`, data)
    }
  }

  // Verify final state
  const { data: allProducts } = await supabase.from('products').select('id, name, user_id, store_id, image_url').order('created_at', { ascending: true })
  console.log('\n=== FINAL PRODUCTS ===')
  console.log(JSON.stringify(allProducts, null, 2))
}

main()
