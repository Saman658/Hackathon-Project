import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'mahrukhariqa@gmail.com',
    password: 'testpassword',
  })
  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'no session' }, { status: 500 })
  }
  return NextResponse.redirect(new URL('/dashboard', 'http://localhost:3000'))
}
