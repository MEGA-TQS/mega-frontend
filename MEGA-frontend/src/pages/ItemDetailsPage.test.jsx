import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ItemDetailsPage from './ItemDetailsPage';
import ItemService from '../services/ItemService';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

vi.mock('../services/ItemService', () => ({
  default: {
    getItemById: vi.fn(),
    addReview: vi.fn(),
  },
}));

vi.mock('../services/BookingService', () => ({
  default: {
    createBooking: vi.fn(),
  },
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockItem = {
  id: 1,
  name: 'Mountain Bike',
  description: 'Great bike',
  pricePerDay: 20,
  location: 'Berlin',
  condition: 'Good',
  owner: { id: 99 },
  reviews: [],
};

const renderWithRouter = (user = null) => {
  useAuth.mockReturnValue({ user });

  return render(
    <MemoryRouter initialEntries={['/items/1']}>
      <Routes>
        <Route path="/items/:id" element={<ItemDetailsPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ItemDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ItemService.getItemById.mockResolvedValue(mockItem);
  });

  it('shows loading state initially', async () => {
    renderWithRouter();
    const loading = screen.queryByText('Loading...');
    expect(loading).not.toBeNull();
    await screen.findByText('Mountain Bike');
  });

  it('renders item details', async () => {
    renderWithRouter();
    const title = await screen.findByText('Mountain Bike');
    expect(title.textContent).toBe('Mountain Bike');
    expect(screen.getByText('€20 / day').textContent).toContain('20');
    expect(screen.getByText('Berlin').textContent).toBe('Berlin');
  });

  it('shows booking form for non-owner user', async () => {
    renderWithRouter({ id: 1 });
    await screen.findByText('Request Booking');
    const startInput = document.querySelector('input[type="date"]');
    const endInput = document.querySelectorAll('input[type="date"]')[1];
    expect(startInput).not.toBeNull();
    expect(endInput).not.toBeNull();
  });

  it('prevents booking when user is not logged in', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    renderWithRouter(null);
    await screen.findByText('Request Booking');
    const btn = screen.getByText('Send Request');
    fireEvent.click(btn);
    expect(window.alert).toHaveBeenCalledWith('Please login to book items.');
  });
});
