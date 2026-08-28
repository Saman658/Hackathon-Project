import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.set('test-cookie', 'test-value', { path: '/', maxAge: 60 })
  return NextResponse.redirect(new URL('/', 'http://localhost:3000'))
}
