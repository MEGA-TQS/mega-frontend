import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ItemFormPage from './ItemFormPage'

// Mock dependencies
vi.mock('../services/ItemService', () => ({
  default: {
    getItemById: vi.fn(() => Promise.resolve({})),
    createItem: vi.fn(() => Promise.resolve({}))
  }
}))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1 }
  })
}))

vi.mock('../constants/categories', () => ({
  CATEGORIES: [
    { name: 'Surf' },
    { name: 'Camping' }
  ]
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({}),
    useNavigate: () => vi.fn()
  }
})

describe('ItemFormPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ItemFormPage />
      </BrowserRouter>
    )
  })
})