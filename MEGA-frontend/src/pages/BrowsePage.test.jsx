import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BrowsePage from './BrowsePage';
import ItemService from '../services/ItemService';

// ---- MOCKS ----
vi.mock('../services/ItemService', () => ({
  default: {
    searchItems: vi.fn(),
  },
}));

vi.mock('../../constants/categories', () => ({
  CATEGORIES: [
    { name: 'Sports', img: 'sports.jpg' },
    { name: 'Electronics', img: 'electronics.jpg' },
  ],
}));

const renderPage = (initialUrl = '/browse') => {
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <BrowsePage />
    </MemoryRouter>
  );
};

describe('BrowsePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches items on mount', async () => {
    ItemService.searchItems.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(ItemService.searchItems).toHaveBeenCalled();
    });
  });

  it('shows empty state when no items found', async () => {
    ItemService.searchItems.mockResolvedValue([]);

    renderPage();

    const emptyMessage = await screen.findByText('No items found 🔍');
    expect(emptyMessage).not.toBeNull();
  });

  it('renders fetched items', async () => {
    ItemService.searchItems.mockResolvedValue([
      {
        id: 1,
        name: 'Surfboard',
        category: 'Sports',
        location: 'Lisbon',
        pricePerDay: 25,
      },
    ]);

    renderPage();

    expect(await screen.findByText('Surfboard')).not.toBeNull();
    expect(screen.getByText('Sports')).not.toBeNull();
    expect(screen.getByText('📍 Lisbon')).not.toBeNull();
    expect(screen.getByText('€25/day')).not.toBeNull();

    const detailsLink = screen.getByRole('link', { name: /view details/i });
    expect(detailsLink.getAttribute('href')).toBe('/items/1');
  });

  it('updates filters and refetches results', async () => {
    ItemService.searchItems.mockResolvedValue([]);

    renderPage();

    const searchInput = screen.getByPlaceholderText('e.g. Surfboard');

    fireEvent.change(searchInput, { target: { value: 'bike' } });

    await waitFor(() => {
      expect(ItemService.searchItems).toHaveBeenLastCalledWith(
        expect.objectContaining({ keyword: 'bike' })
      );
    });
  });

  it('clears filters when Clear Filters is clicked', async () => {
    ItemService.searchItems.mockResolvedValue([]);

    renderPage('/browse?keyword=bike');

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    fireEvent.click(clearBtn);

    await waitFor(() => {
      expect(ItemService.searchItems).toHaveBeenLastCalledWith({
        keyword: '',
        location: '',
        category: '',
        minPrice: '',
        maxPrice: '',
      });
    });
  });

  it('shows correct results count text', async () => {
    ItemService.searchItems.mockResolvedValue([
      { id: 1, name: 'Item A', category: 'Sports', location: 'Rome', pricePerDay: 10 },
      { id: 2, name: 'Item B', category: 'Sports', location: 'Rome', pricePerDay: 12 },
    ]);

    renderPage();

    const resultsText = await screen.findByText('2 Results');
    expect(resultsText).not.toBeNull();
  });

  it('shows keyword in header when searching', async () => {
    ItemService.searchItems.mockResolvedValue([]);

    renderPage('/browse?keyword=camera');

    const keywordHeader = await screen.findByText(/for "camera"/);
    expect(keywordHeader).not.toBeNull();
  });
});
