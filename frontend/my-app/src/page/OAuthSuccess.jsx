import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { base44 } from '@/api/base44Client'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      base44.auth.setToken(token)
      window.location.href = '/'
      return
    }

    window.location.href = '/login?error=oauth_failed'
  }, [searchParams])

  return null
}
