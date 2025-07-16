/**
 * @vitest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider } from '../context/AuthContext'
import Login from '../pages/Auth/Login'
import api from '../api/api'

// Mock the api module
vi.mock('../api/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  },
}))

// Mock react-router-dom
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should allow a user to log in and redirects to home', async () => {
    // Arrange: Mock a successful API response
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' }
    const mockResponse = {
      data: { data: mockUser },
      headers: { authorization: 'Bearer fake-jwt-token' }
    }
    api.post.mockResolvedValue(mockResponse)
    
    // Also mock the get call for user me
    api.get.mockResolvedValue({ data: mockUser })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )

    // Act: Simulate user input
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Password123!' },
    })
    fireEvent.click(screen.getByRole('button', { name: /log in/i }))

    // Assert: Check if login was successful and navigation occurred
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/sign_in', {
        user: {
          email: 'test@example.com',
          password: 'Password123!',
        },
      })
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
