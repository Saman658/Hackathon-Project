import { createClient } from './client'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), ms)
    ),
  ])
}

export async function getCurrentUser() {
  const supabase = createClient()
  try {
    const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000)
    return user
  } catch {
    return null
  }
}

export async function getProfile() {
  const supabase = createClient()
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000)
  
  if (!user) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) return null
  return data
}

export async function upsertProfile(profile: { name?: string; business_name?: string; email?: string }) {
  const supabase = createClient()
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000)
  
  if (!user) throw new Error('Not authenticated')
  
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      ...profile
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function updatePasswordWithCurrent(currentPassword: string, newPassword: string) {
  const supabase = createClient()
  
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000)
  if (!user) throw new Error('Not authenticated')
  
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  })
  
  if (verifyError) {
    throw new Error('Current password is incorrect')
  }
  
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function updateEmail(newEmail: string) {
  const supabase = createClient()
  const { data: { user } } = await withTimeout(supabase.auth.getUser(), 5000)
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw error
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
}
