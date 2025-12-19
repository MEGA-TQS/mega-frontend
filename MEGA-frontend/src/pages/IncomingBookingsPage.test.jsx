import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import IncomingBookingsPage from './IncomingBookingsPage';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

// ---- MOCKS ----

// Mock BookingService
vi.mock('../services/BookingService', () => ({
  default: {
    getIncomingBookings: vi.fn(),
    acceptBooking: vi.fn(),
    declineBooking: vi.fn(),
  },
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('IncomingBookingsPage', () => {
  const mockOwner = { id: 10, name: 'Owner' };

  const pendingBooking = {
    id: 1,
    status: 'PENDING',
    startDate: '2025-01-01',
    endDate: '2025-01-05',
    renter: { name: 'Alice' },
    items: [{ item: { name: 'Camera' } }],
  };

  const approvedBooking = {
    ...pendingBooking,
    id: 2,
    status: 'APPROVED',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockOwner });
  });

  it('fetches incoming bookings on mount', async () => {
    BookingService.getIncomingBookings.mockResolvedValue([pendingBooking]);

    render(<IncomingBookingsPage />);

    const item = await screen.findByText('Camera');
    expect(item).not.toBeNull();
    expect(BookingService.getIncomingBookings).toHaveBeenCalledWith(10);
  });

  it('renders Accept and Decline buttons for pending bookings', async () => {
    BookingService.getIncomingBookings.mockResolvedValue([pendingBooking]);

    render(<IncomingBookingsPage />);

    const acceptBtn = await screen.findByText('Accept');
    const declineBtn = screen.getByText('Decline');
    expect(acceptBtn).not.toBeNull();
    expect(declineBtn).not.toBeNull();
  });

  it('does not render action buttons for non-pending bookings', async () => {
    BookingService.getIncomingBookings.mockResolvedValue([approvedBooking]);

    render(<IncomingBookingsPage />);

    const status = await screen.findByText('APPROVED');
    expect(status).not.toBeNull();
    expect(screen.queryByText('Accept')).toBeNull();
    expect(screen.queryByText('Decline')).toBeNull();
  });

  it('accepts a booking and refreshes the list', async () => {
    BookingService.getIncomingBookings
      .mockResolvedValueOnce([pendingBooking])
      .mockResolvedValueOnce([{ ...pendingBooking, status: 'APPROVED' }]);

    BookingService.acceptBooking.mockResolvedValue({});

    render(<IncomingBookingsPage />);

    const acceptBtn = await screen.findByText('Accept');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(BookingService.acceptBooking).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('APPROVED')).not.toBeNull();
    });
  });

  it('declines a booking and refreshes the list', async () => {
    BookingService.getIncomingBookings
      .mockResolvedValueOnce([pendingBooking])
      .mockResolvedValueOnce([{ ...pendingBooking, status: 'DECLINED' }]);

    BookingService.declineBooking.mockResolvedValue({});

    render(<IncomingBookingsPage />);

    const declineBtn = await screen.findByText('Decline');
    fireEvent.click(declineBtn);

    await waitFor(() => {
      expect(BookingService.declineBooking).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.getByText('DECLINED')).not.toBeNull();
    });
  });

  it('shows alert on action failure', async () => {
    BookingService.getIncomingBookings.mockResolvedValue([pendingBooking]);
    BookingService.acceptBooking.mockRejectedValue(new Error('Failed'));

    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<IncomingBookingsPage />);

    const acceptBtn = await screen.findByText('Accept');
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Action failed');
    });
  });

  it('does not fetch bookings if user is null', () => {
    useAuth.mockReturnValue({ user: null });

    render(<IncomingBookingsPage />);

    expect(BookingService.getIncomingBookings).not.toHaveBeenCalled();
  });
});
