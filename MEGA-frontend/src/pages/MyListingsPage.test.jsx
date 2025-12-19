import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MyListingsPage from './MyListingsPage';
import { useAuth } from '../context/AuthContext';
import ItemService from '../services/ItemService';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/ItemService', () => ({
  default: {
    getMyListings: vi.fn(),
    deleteItem: vi.fn(),
    updatePrice: vi.fn(),
  },
}));

describe('MyListingsPage Actions', () => {
  const mockUser = { id: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });

    ItemService.getMyListings.mockResolvedValue([
      { id: 1, name: 'Bike', pricePerDay: 10, active: true },
    ]);
    ItemService.updatePrice.mockResolvedValue({ id: 1, pricePerDay: 15 });
  });

  it('updates price locally when Edit Price is clicked', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('15');
    render(
      <BrowserRouter>
        <MyListingsPage />
      </BrowserRouter>
    );

    const editBtn = await screen.findByText('Edit Price');
    fireEvent.click(editBtn);

    await waitFor(() => {
      const item = screen.getByText(/Bike - €15/);
      expect(item).not.toBeNull();
    });
  });

  it('renders listings from API', async () => {
    render(
      <BrowserRouter>
        <MyListingsPage />
      </BrowserRouter>
    );
    const item = await screen.findByText(/Bike/);
    expect(item).not.toBeNull();
    const price = screen.getByText(/€10/);
    expect(price).not.toBeNull();
  });
});
