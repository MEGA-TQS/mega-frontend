import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingService from './BookingService';
import api from '../api/axiosConfig';

// Mock axiosConfig
vi.mock('../api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    it('creates a booking request', async () => {
      const bookingData = {
        renterId: 1,
        itemIds: [2, 3],
        startDate: '2025-01-01',
        endDate: '2025-01-05',
      };

      const responseData = { id: 10, status: 'PENDING' };
      api.post.mockResolvedValue({ data: responseData });

      const result = await BookingService.createBooking(bookingData);

      expect(api.post).toHaveBeenCalledWith('/bookings', bookingData);
      expect(result).toEqual(responseData);
    });
  });

  describe('getIncomingBookings', () => {
    it('fetches incoming bookings for owner', async () => {
      const bookings = [{ id: 1 }, { id: 2 }];
      api.get.mockResolvedValue({ data: bookings });

      const result = await BookingService.getIncomingBookings(5);

      expect(api.get).toHaveBeenCalledWith('/bookings/owner/5');
      expect(result).toEqual(bookings);
    });
  });

  describe('getMyBookings', () => {
    it('fetches bookings for renter', async () => {
      const bookings = [{ id: 3 }];
      api.get.mockResolvedValue({ data: bookings });

      const result = await BookingService.getMyBookings(7);

      expect(api.get).toHaveBeenCalledWith('/bookings/renter/7');
      expect(result).toEqual(bookings);
    });
  });

  describe('acceptBooking', () => {
    it('accepts a booking', async () => {
      const updatedBooking = { id: 1, status: 'ACCEPTED' };
      api.patch.mockResolvedValue({ data: updatedBooking });

      const result = await BookingService.acceptBooking(1);

      expect(api.patch).toHaveBeenCalledWith('/bookings/1/accept');
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('declineBooking', () => {
    it('declines a booking', async () => {
      const updatedBooking = { id: 1, status: 'DECLINED' };
      api.patch.mockResolvedValue({ data: updatedBooking });

      const result = await BookingService.declineBooking(1);

      expect(api.patch).toHaveBeenCalledWith('/bookings/1/decline');
      expect(result).toEqual(updatedBooking);
    });
  });

  describe('payBooking', () => {
    it('processes a booking payment', async () => {
      const paymentResponse = { success: true };
      api.post.mockResolvedValue({ data: paymentResponse });

      const result = await BookingService.payBooking(9, 250);

      expect(api.post).toHaveBeenCalledWith('/payments/pay', {
        bookingId: 9,
        amount: 250,
        paymentMethod: 'CREDIT_CARD',
      });
      expect(result).toEqual(paymentResponse);
    });
  });
});
