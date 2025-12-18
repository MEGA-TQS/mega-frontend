import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingService from './BookingService';

// Mock the axios instance INSIDE the factory function
vi.mock('../api/axiosConfig', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  };
  return {
    default: mockApi
  };
});

// Now we need to get the mocked instance
const mockApi = await import('../api/axiosConfig').then(module => module.default);

describe('BookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBooking', () => {
    const mockBookingData = {
      renterId: 'renter123',
      itemIds: [1, 2, 3],
      startDate: '2024-01-15',
      endDate: '2024-01-20'
    };

    const mockCreatedBooking = {
      id: 'booking456',
      ...mockBookingData,
      status: 'PENDING'
    };

    it('should create booking successfully', async () => {
      const mockResponse = { data: mockCreatedBooking };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await BookingService.createBooking(mockBookingData);

      expect(mockApi.post).toHaveBeenCalledWith('/bookings', mockBookingData);
      expect(result).toEqual(mockCreatedBooking);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Item not available');
      mockApi.post.mockRejectedValue(mockError);

      await expect(BookingService.createBooking(mockBookingData)).rejects.toThrow('Item not available');
    });

    it('should handle empty itemIds array', async () => {
      const bookingData = { ...mockBookingData, itemIds: [] };
      const mockResponse = { data: { id: 'booking789', ...bookingData, status: 'PENDING' } };
      mockApi.post.mockResolvedValue(mockResponse);

      await BookingService.createBooking(bookingData);

      expect(mockApi.post).toHaveBeenCalledWith('/bookings', bookingData);
    });
  });

  describe('getOwnerBookings', () => {
    const ownerId = 'owner123';
    const mockAllBookings = [
      { id: 1, ownerId: 'owner123', renterId: 'renter1', status: 'PENDING' },
      { id: 2, ownerId: 'owner456', renterId: 'renter2', status: 'CONFIRMED' },
      { id: 3, ownerId: 'owner123', renterId: 'renter3', status: 'PENDING' }
    ];

    it('should filter bookings by ownerId', async () => {
      const mockResponse = { data: mockAllBookings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await BookingService.getOwnerBookings(ownerId);

      expect(mockApi.get).toHaveBeenCalledWith('/bookings');
      expect(result).toHaveLength(2);
      expect(result.every(booking => booking.ownerId === ownerId)).toBe(true);
    });

    it('should return empty array when no bookings match ownerId', async () => {
      const mockResponse = { data: mockAllBookings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await BookingService.getOwnerBookings('nonExistentOwner');

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Failed to fetch');
      mockApi.get.mockRejectedValue(mockError);

      await expect(BookingService.getOwnerBookings(ownerId)).rejects.toThrow('Failed to fetch');
    });
  });

  describe('updateStatus', () => {
    const bookingId = 'booking123';
    const ownerId = 'owner456';
    
    it('should send PATCH request with correct parameters for approval', async () => {
      const mockResponse = { data: { success: true } };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await BookingService.updateStatus(bookingId, ownerId, true);

      expect(mockApi.patch).toHaveBeenCalledWith(
        `/bookings/${bookingId}/status`,
        null,
        { params: { ownerId, approved: true } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should send PATCH request with correct parameters for rejection', async () => {
      const mockResponse = { data: { success: true } };
      mockApi.patch.mockResolvedValue(mockResponse);

      await BookingService.updateStatus(bookingId, ownerId, false);

      expect(mockApi.patch).toHaveBeenCalledWith(
        `/bookings/${bookingId}/status`,
        null,
        { params: { ownerId, approved: false } }
      );
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Unauthorized');
      mockApi.patch.mockRejectedValue(mockError);

      await expect(BookingService.updateStatus(bookingId, ownerId, true))
        .rejects.toThrow('Unauthorized');
    });
  });

  describe('payBooking', () => {
    const bookingId = 'booking789';

    it('should send POST request to pay endpoint', async () => {
      const mockResponse = { data: { success: true, status: 'PAID' } };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await BookingService.payBooking(bookingId);

      expect(mockApi.post).toHaveBeenCalledWith(`/bookings/${bookingId}/pay`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle payment errors', async () => {
      const mockError = new Error('Payment failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(BookingService.payBooking(bookingId)).rejects.toThrow('Payment failed');
    });
  });

  describe('getRenterBookings', () => {
    const renterId = 'renter123';
    const mockAllBookings = [
      { id: 1, renterId: 'renter123', ownerId: 'owner1', status: 'PENDING' },
      { id: 2, renterId: 'renter456', ownerId: 'owner2', status: 'CONFIRMED' },
      { id: 3, renterId: 'renter123', ownerId: 'owner3', status: 'COMPLETED' }
    ];

    it('should filter bookings by renterId', async () => {
      const mockResponse = { data: mockAllBookings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await BookingService.getRenterBookings(renterId);

      expect(mockApi.get).toHaveBeenCalledWith('/bookings');
      expect(result).toHaveLength(2);
      expect(result.every(booking => booking.renterId === renterId)).toBe(true);
    });

    it('should return empty array when no bookings match renterId', async () => {
      const mockResponse = { data: mockAllBookings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await BookingService.getRenterBookings('nonExistentRenter');

      expect(result).toEqual([]);
    });

    it('should preserve booking data structure', async () => {
      const mockResponse = { data: mockAllBookings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await BookingService.getRenterBookings(renterId);

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('renterId');
      expect(result[0]).toHaveProperty('ownerId');
      expect(result[0]).toHaveProperty('status');
    });
  });
});