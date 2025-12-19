import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MyBookingsPage from './MyBookingsPage';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

// ---- MOCKS ----

// Mock BookingService
vi.mock('../services/BookingService', () => ({
  default: {
    getMyBookings: vi.fn(),
    payBooking: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('MyBookingsPage', () => {
  const mockUser = { id: 42 };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
  });

  it('shows empty state when no bookings exist', async () => {
    BookingService.getMyBookings.mockResolvedValue([]);

    render(<MyBookingsPage />);

    const emptyMessage = await screen.findByText("You haven't made any bookings yet.");
    expect(emptyMessage).not.toBeNull();

    expect(BookingService.getMyBookings).toHaveBeenCalledWith(42);
  });

  it('renders bookings from API', async () => {
    BookingService.getMyBookings.mockResolvedValue([
      {
        id: 1,
        status: 'PAID',
        startDate: '2025-01-01',
        endDate: '2025-01-05',
        totalPrice: 200,
        items: [{ item: { name: 'Mountain Bike' } }],
      },
    ]);

    render(<MyBookingsPage />);

    expect(await screen.findByText('Booking #1')).not.toBeNull();
    expect(screen.getByText('Mountain Bike')).not.toBeNull();
    expect(screen.getByText('€200')).not.toBeNull();
    expect(screen.getByText('PAID')).not.toBeNull();
  });

  it('shows Pay Now button only for APPROVED bookings', async () => {
    BookingService.getMyBookings.mockResolvedValue([
      {
        id: 2,
        status: 'APPROVED',
        startDate: '2025-02-01',
        endDate: '2025-02-03',
        totalPrice: 150,
        items: [],
      },
    ]);

    render(<MyBookingsPage />);

    const payButton = await screen.findByRole('button', { name: /pay now/i });
    expect(payButton).not.toBeNull();
  });

  it('handles payment flow correctly', async () => {
    BookingService.getMyBookings
      .mockResolvedValueOnce([
        {
          id: 3,
          status: 'APPROVED',
          startDate: '2025-03-01',
          endDate: '2025-03-02',
          totalPrice: 99,
          items: [],
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 3,
          status: 'PAID',
          startDate: '2025-03-01',
          endDate: '2025-03-02',
          totalPrice: 99,
          items: [],
        },
      ]);

    BookingService.payBooking.mockResolvedValue({ success: true });

    // Mock alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<MyBookingsPage />);

    const payButton = await screen.findByRole('button', { name: /pay now/i });
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(BookingService.payBooking).toHaveBeenCalledWith(3, 99);
    });

    await waitFor(() => {
      expect(screen.getByText('PAID')).not.toBeNull();
    });

    expect(window.alert).toHaveBeenCalledWith(
      'Payment Successful! Booking is now PAID.'
    );
  });

  it('does not fetch bookings if user is null', () => {
    useAuth.mockReturnValue({ user: null });

    render(<MyBookingsPage />);

    expect(BookingService.getMyBookings).not.toHaveBeenCalled();
  });
});
