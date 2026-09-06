import { createClient } from '@supabase/supabase-js'

const url = 'https://niewgxzvphwosfuwzggy.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdneHp2cGh3b3NmdXd6Z2d5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTEyMzAxNiwiZXhwIjoyMTAwNjk5MDE2fQ.hGTGebpHuVJTav51bPC8LDVG1N2M8thCWqPGNLOqieI'
const supabase = createClient(url, key)

const SEHRISH_STORE_ID = 'd75917db-b09b-4e7a-acb8-9cfb0ac32df9'

async function main() {
  const updates = [
    {
      id: '72e27db4-f8c3-4b3a-8dea-ef58f85c288d',
      name: 'Headphone',
      image_url: 'https://w0.peakpx.com/wallpaper/73/599/HD-wallpaper-wireless-headphones-with-yellow-background.jpg',
    },
    {
      id: '5a8eaace-52d0-421d-a723-880e8b7ae885',
      name: 'Suit Piece',
      image_url: 'https://www.hussainitextileshop.com/wp-content/uploads/2024/03/DA1191-BLACK-RS-36990-02_1024x1024.webp',
    },
    {
      id: '6af772e9-7df3-4eb9-8ab1-8f5daa9af6a6',
      name: 'Baby Girl Shirt',
      image_url: 'https://static.vecteezy.com/system/resources/thumbnails/054/627/284/small_2x/pink-kids-t-shirt-perfect-for-valentine-s-day-photo.jpeg',
    },
    {
      id: '250a5bb4-63c7-4640-922e-ee6c8b835706',
      name: 'Shoes',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D',
    },
  ]

  for (const upd of updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ image_url: upd.image_url })
      .eq('id', upd.id)
      .eq('store_id', SEHRISH_STORE_ID)
      .select('id, name, image_url')
      .single()

    if (error) {
      console.error(`Error updating ${upd.name}:`, error)
    } else {
      console.log(`Updated ${upd.name}: ${data?.image_url}`)
    }
  }

  console.log('\nDone')
}

main().catch(console.error)
