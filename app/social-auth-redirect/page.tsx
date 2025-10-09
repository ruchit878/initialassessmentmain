'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function SocialAuthRedirectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()

  useEffect(() => {
    const userParam = searchParams.get('user')
    if (!userParam) {
      router.replace('/?error=no_user')
      return
    }

    try {
      const json = atob(decodeURIComponent(userParam))
      const user = JSON.parse(json)
      setUser(user)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', user.email || '')
      }
      router.replace('/dashboard')
    } catch (e) {
      router.replace('/?error=invalid_user_data')
    }
  }, [router, searchParams, setUser])

  return <div className="min-h-[40vh] grid place-items-center">Signing you in...</div>
}
