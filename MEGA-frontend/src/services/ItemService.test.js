import { describe, it, expect, vi, beforeEach } from 'vitest';
import ItemService from './ItemService';

// Create the mock first using vi.hoisted
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn()
}));

// Then mock the module using the hoisted mock
vi.mock('../api/axiosConfig', () => ({
  default: mockApi
}));

describe('ItemService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchItems', () => {
    const mockFilters = {
      keyword: 'test',
      category: 'electronics',
      location: 'New York',
      minPrice: 10,
      maxPrice: 100,
      startDate: '2024-01-01',
      endDate: '2024-01-10'
    };

    const mockItems = [{ id: 1, name: 'Test Item' }];

    it('should send request with correct parameters and return data on success', async () => {
      const mockResponse = { data: mockItems };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await ItemService.searchItems(mockFilters);

      // URLSearchParams uses + for spaces, not %20
      expect(mockApi.get).toHaveBeenCalledWith(
        '/items?keyword=test&category=electronics&location=New+York&minPrice=10&maxPrice=100&startDate=2024-01-01&endDate=2024-01-10'
      );
      expect(result).toEqual(mockItems);
    });

    it('should filter out empty filter values', async () => {
      const filtersWithEmptyValues = {
        keyword: 'test',
        category: '',
        location: null,
        minPrice: undefined
      };
      const mockResponse = { data: mockItems };
      mockApi.get.mockResolvedValue(mockResponse);

      await ItemService.searchItems(filtersWithEmptyValues);

      expect(mockApi.get).toHaveBeenCalledWith('/items?keyword=test');
    });

    it('should return empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockApi.get.mockRejectedValue(new Error('Network error'));

      const result = await ItemService.searchItems(mockFilters);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Search failed', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle filters with special characters in URL encoding', async () => {
      const filters = { keyword: 'laptop & phone', location: 'San Francisco, CA' };
      mockApi.get.mockResolvedValue({ data: mockItems });

      await ItemService.searchItems(filters);

      // Note: URLSearchParams encodes spaces as + and ampersand as %26
      expect(mockApi.get).toHaveBeenCalledWith(
        '/items?keyword=laptop+%26+phone&location=San+Francisco%2C+CA'
      );
    });
  });

  describe('getAllItems', () => {
    const mockItems = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

    it('should fetch all items successfully', async () => {
      const mockResponse = { data: mockItems };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await ItemService.getAllItems();

      expect(mockApi.get).toHaveBeenCalledWith('/items');
      expect(result).toEqual(mockItems);
    });

    it('should throw error on failed fetch', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Failed to fetch');
      mockApi.get.mockRejectedValue(mockError);

      await expect(ItemService.getAllItems()).rejects.toThrow('Failed to fetch');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching items', mockError);
      consoleSpy.mockRestore();
    });
  });

  describe('createItem', () => {
    const mockItemData = {
      name: 'New Item',
      description: 'Test description',
      price: 50
    };

    const mockCreatedItem = { id: 3, ...mockItemData };

    it('should create item successfully', async () => {
      const mockResponse = { data: mockCreatedItem };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await ItemService.createItem(mockItemData);

      expect(mockApi.post).toHaveBeenCalledWith('/items', mockItemData);
      expect(result).toEqual(mockCreatedItem);
    });

    it('should pass through API errors', async () => {
      const mockError = new Error('Validation failed');
      mockApi.post.mockRejectedValue(mockError);

      await expect(ItemService.createItem(mockItemData)).rejects.toThrow('Validation failed');
    });
  });

  describe('getMyListings', () => {
    const ownerId = 'user123';
    const mockListings = [
      { id: 1, name: 'My Item 1', ownerId },
      { id: 2, name: 'My Item 2', ownerId }
    ];

    it('should fetch listings for specific owner', async () => {
      const mockResponse = { data: mockListings };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await ItemService.getMyListings(ownerId);

      expect(mockApi.get).toHaveBeenCalledWith(`/items/owner/${ownerId}`);
      expect(result).toEqual(mockListings);
    });

    it('should throw error on failed fetch', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockError = new Error('Not found');
      mockApi.get.mockRejectedValue(mockError);

      await expect(ItemService.getMyListings(ownerId)).rejects.toThrow('Not found');
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching my listings', mockError);
      consoleSpy.mockRestore();
    });

    it('should handle different owner ID formats', async () => {
      const numericOwnerId = 123;
      const mockResponse = { data: [] };
      mockApi.get.mockResolvedValue(mockResponse);

      await ItemService.getMyListings(numericOwnerId);

      expect(mockApi.get).toHaveBeenCalledWith('/items/owner/123');
    });
  });

  describe('updatePrice', () => {
    it('should send price in JSON body and ownerId in params', async () => {
      mockApi.patch.mockResolvedValue({ data: { id: 1, pricePerDay: 99 } });

      const result = await ItemService.updatePrice(1, 99, 123);

      // Verify ownerId is in URL and price is in BODY
      expect(mockApi.patch).toHaveBeenCalledWith(
        '/items/1/price?ownerId=123',
        { newPrice: 99 } // Matches ItemPriceUpdateDTO
      );
      expect(result.pricePerDay).toBe(99);
    });
  });

  describe('deleteItem', () => {
    it('should call DELETE endpoint with correct id', async () => {
      mockApi.delete.mockResolvedValue({});
      await ItemService.deleteItem(5);
      expect(mockApi.delete).toHaveBeenCalledWith('/items/5');
    });
  });

  describe('addReview', () => {
    it('should send review data in JSON body', async () => {
      const reviewData = { reviewerId: 1, rating: 5, comment: 'Great!' };
      mockApi.post.mockResolvedValue({ data: reviewData });

      await ItemService.addReview(1, reviewData);

      expect(mockApi.post).toHaveBeenCalledWith('/items/1/reviews', reviewData);
    });
  });
});