import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, test, vi, beforeEach } from 'vitest'

import AppHeader from './AppHeader'
import { LanguageProvider } from '@/lib/LanguageContext'
import { base44 } from '@/api/base44Client'

vi.mock('@/api/base44Client', () => ({
  base44: {
    auth: {
      me: vi.fn(),
    },
  },
}))

function renderHeader() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MemoryRouter>
          <AppHeader />
        </MemoryRouter>
      </LanguageProvider>
    </QueryClientProvider>,
  )
}

describe('AppHeader auth button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('shows Login when user is not authenticated', () => {
    renderHeader()

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(base44.auth.me).not.toHaveBeenCalled()
  })

  test('shows user full name when token exists and profile is loaded', async () => {
    localStorage.setItem('savora_token', 'mock-token')
    base44.auth.me.mockResolvedValue({ fullName: 'Jannguyen' })

    renderHeader()

    await waitFor(() => {
      expect(screen.getByText('Jannguyen')).toBeInTheDocument()
    })

    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(base44.auth.me).toHaveBeenCalledTimes(1)
  })
})
