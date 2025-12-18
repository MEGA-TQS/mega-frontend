import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyBookingsPage from './MyBookingsPage'

// Mock the service
vi.mock('../services/BookingService', () => ({
  default: {
    getRenterBookings: vi.fn(() => Promise.resolve([])),
    payBooking: vi.fn(() => Promise.resolve({}))
  }
}))

describe('MyBookingsPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <MyBookingsPage />
      </BrowserRouter>
    )
  })
})