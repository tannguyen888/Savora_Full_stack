import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { savouraClient } from '@/api/savouraClient'

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      savouraClient.auth.setToken(token)
      window.location.href = '/'
      return
    }

    window.location.href = '/login?error=oauth_failed'
  }, [searchParams])

  return null
}

