import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyListingsPage from './MyListingsPage'

// Mock services and context
vi.mock('../services/ItemService', () => ({
  default: {
    getMyListings: vi.fn(() => Promise.resolve([])),
    deleteItem: vi.fn(() => Promise.resolve({}))
  }
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' }
  })
}))

describe('MyListingsPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <MyListingsPage />
      </BrowserRouter>
    )
  })
})