import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PaymentPage from './PaymentPage'

// Mock dependencies
vi.mock('../services/BookingService', () => ({
  default: {
    payBooking: vi.fn(() => Promise.resolve({}))
  }
}))

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: () => ({ bookingId: '123' }),
    useNavigate: () => vi.fn()
  }
})

describe('PaymentPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <PaymentPage />
      </BrowserRouter>
    )
  })
})