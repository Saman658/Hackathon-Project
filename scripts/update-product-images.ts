import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

async function main() {
  const updates = [
    {
      id: '46c139b2-4855-4779-ab1d-334672e9594f',
      image_url: 'https://w0.peakpx.com/wallpaper/73/599/HD-wallpaper-wireless-headphones-with-yellow-background.jpg',
      name: 'Headphone'
    },
    {
      id: '2f3985d3-cd25-41b6-a0ea-90b631d9ef37',
      image_url: 'https://www.hussainitextileshop.com/wp-content/uploads/2024/03/DA1191-BLACK-RS-36990-02_1024x1024.webp',
      name: 'Suit Piece'
    },
    {
      id: '2becf245-7f98-4c65-b82b-272d464554e6',
      image_url: 'https://static.vecteezy.com/system/resources/thumbnails/054/627/284/small_2x/pink-kids-t-shirt-perfect-for-valentine-s-day-photo.jpeg',
      name: 'Baby Girl Shirt'
    },
    {
      id: '5d76bb5a-e715-48d2-a250-95db7b87e2e4',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D',
      name: 'Shoes'
    }
  ]

  for (const item of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: item.image_url })
      .eq('id', item.id)
      .eq('store_id', SEHRISH_STORE_ID)
      .select('id, name, image_url')
      .single()

    if (error) {
      console.error(`Error updating ${item.name}:`, error)
    } else {
      console.log(`Updated ${item.name}:`, data?.image_url)
    }
  }
}

main().catch(console.error)
