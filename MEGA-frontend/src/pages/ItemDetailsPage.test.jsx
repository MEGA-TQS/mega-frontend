import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ItemDetailsPage from './ItemDetailsPage'

// Mock all dependencies
vi.mock('../services/ItemService', () => ({
  default: { getAllItems: vi.fn(() => Promise.resolve([])) }
}))

vi.mock('../services/BookingService', () => ({
  default: { createBooking: vi.fn(() => Promise.resolve({})) }
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  }
})

describe('ItemDetailsPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ItemDetailsPage />
      </BrowserRouter>
    )
  })
})