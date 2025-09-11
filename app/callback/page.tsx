// app/callback/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

interface Props {
  searchParams: { code?: string }
}

export default async function AuthCallbackPage({ searchParams }: Props) {
  const code = searchParams?.code

  if (!code) {
    redirect('/login?error=no_code')
  }

  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth error:', error)
      redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }
    
    // Successfully authenticated
    redirect('/dashboard')
  } catch (error) {
    console.error('Unexpected error:', error)
    redirect('/login?error=unexpected_error')
  }
}