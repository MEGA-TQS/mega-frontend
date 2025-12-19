import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

// Mock auth context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn()
  })
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )
  })
})