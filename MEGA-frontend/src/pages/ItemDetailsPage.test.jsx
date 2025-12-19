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

  it('shows loading state initially', async () => {
    renderWithRouter();
    expect(screen.queryByText('Loading...')).toBeTruthy();
    await screen.findByText('Mountain Bike');
  });

  it('renders item details correctly', async () => {
    renderWithRouter();
    const title = await screen.findByText('Mountain Bike');
    expect(title).toBeDefined();
    expect(screen.getByText('€20 / day')).toBeDefined();
    expect(screen.getByText('Berlin')).toBeDefined();
  });

  it('calls BookingService on valid form submission', async () => {
    renderWithRouter({ id: 10 }); // Not the owner
    
    await screen.findByText('Mountain Bike');
    
    fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2025-01-01' } });
    fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2025-01-05' } });
    
    fireEvent.click(screen.getByText('Send Request'));

    await waitFor(() => {
      expect(BookingService.createBooking).toHaveBeenCalledWith({
        renterId: 10,
        itemIds: [1],
        startDate: '2025-01-01',
        endDate: '2025-01-05',
      });
    });
  });

  it('shows owner alert instead of booking form when user is owner', async () => {
    renderWithRouter({ id: 99 }); // ID matches mockItem.owner.id
    
    await screen.findByText('Mountain Bike');
    // Replaced toBeInTheDocument with toBeDefined
    expect(screen.getByText(/You are the owner of this item/i)).toBeDefined();
    expect(screen.queryByText('Send Request')).toBeNull();
  });

  it('prevents booking when user is not logged in', async () => {
    renderWithRouter(null);
    await screen.findByText('Request Booking');
    
    fireEvent.click(screen.getByText('Send Request'));
    expect(window.alert).toHaveBeenCalledWith('Please login to book items.');
  });

  it('allows submitting a review when logged in', async () => {
    const mockReview = { rating: 5, comment: 'Excellent!', reviewer: { name: 'Test' } };
    ItemService.addReview.mockResolvedValue(mockReview);

    renderWithRouter({ id: 10 });
    await screen.findByText('Mountain Bike');
    
    fireEvent.change(screen.getByLabelText(/Comment/i), { target: { value: 'Excellent!' } });
    fireEvent.click(screen.getByText('Submit Review'));

    await waitFor(() => {
      expect(ItemService.addReview).toHaveBeenCalledWith(1, {
        reviewerId: 10,
        rating: 5,
        comment: 'Excellent!',
      });
      expect(screen.getByText('Excellent!')).toBeDefined();
    });
  });

  it('handles item not found error', async () => {
    ItemService.getItemById.mockResolvedValue(null);
    renderWithRouter();
    
    const errorMsg = await screen.findByText('Item not found');
    expect(errorMsg).toBeDefined();
  });
});
