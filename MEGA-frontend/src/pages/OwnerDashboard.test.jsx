import { describe, it, vi, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import OwnerDashboard from './OwnerDashboard';
import BookingService from '../services/BookingService';

// Mock Auth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 5, name: "Owner Bob" }
  })
}));

// Mock Services
vi.mock('../services/BookingService', () => ({
  default: {
    getOwnerBookings: vi.fn(() => Promise.resolve([])),
    updateStatus: vi.fn(() => Promise.resolve({}))
  }
}));

describe('OwnerDashboard', () => {
  it('loads bookings for the logged in user', async () => {
    render(<OwnerDashboard />);

    await waitFor(() => {
        // Verify it called service with user.id (5)
        expect(BookingService.getOwnerBookings).toHaveBeenCalledWith(5);
    });
  });
});