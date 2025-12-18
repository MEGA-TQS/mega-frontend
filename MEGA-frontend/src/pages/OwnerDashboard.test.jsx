import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import OwnerDashboard from './OwnerDashboard'

// Mock the service
vi.mock('../services/BookingService', () => ({
  default: {
    getOwnerBookings: vi.fn(() => Promise.resolve([])),
    updateStatus: vi.fn(() => Promise.resolve({}))
  }
}))

describe('OwnerDashboard', () => {
  it('renders without crashing', () => {
    render(<OwnerDashboard />)
  })
})