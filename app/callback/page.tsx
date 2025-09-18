'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        // Check for errors in URL
        if (error) {
          console.error('Auth error from URL:', error, errorDescription)
          setStatus('error')
          setMessage(errorDescription || error)
          return
        }

        // Let Supabase handle the callback automatically
        // This will process any auth callback (email confirmation, OAuth, etc.)
        const { data, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setStatus('error')
          setMessage(sessionError.message)
          return
        }

        // If we have a session, the user is authenticated
        if (data?.session?.user) {
          setStatus('success')
          setMessage('Account succesvol geverifieerd!')
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          // Try to exchange any code or process the callback
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')
          const tokenHash = urlParams.get('token_hash')
          const type = urlParams.get('type')
          
          if (code) {
            // Handle OAuth code exchange
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            
            if (exchangeError) {
              console.error('Exchange error:', exchangeError)
              setStatus('error')
              setMessage(exchangeError.message)
              return
            }
            
            if (exchangeData?.user) {
              setStatus('success')
              setMessage('Account succesvol geverifieerd!')
              
              setTimeout(() => {
                router.push('/dashboard')
              }, 2000)
            }
          } else if (tokenHash && type) {
            // Handle email confirmation
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: type as any
            })
            
            if (verifyError) {
              console.error('Verify error:', verifyError)
              setStatus('error')
              setMessage(verifyError.message)
              return
            }
            
            if (verifyData?.user) {
              setStatus('success')
              setMessage('Account succesvol geverifieerd!')
              
              setTimeout(() => {
                router.push('/dashboard')
              }, 2000)
            }
          } else {
            setStatus('error')
            setMessage('Geen geldige authenticatie parameters ontvangen')
            return
          }
        }

      } catch (error) {
        console.error('Unexpected error:', error)
        setStatus('error')
        setMessage('Er is een onverwachte fout opgetreden')
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  // Rest of your component remains the same...
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Account verifiëren...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Even geduld, we verifiëren uw account.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            🎉 Gefeliciteerd!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Uw account is succesvol aangemaakt en geverifieerd.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            U wordt doorgestuurd naar het dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Verificatie mislukt
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Terug naar home
        </button>
      </div>
    </div>
  )
}