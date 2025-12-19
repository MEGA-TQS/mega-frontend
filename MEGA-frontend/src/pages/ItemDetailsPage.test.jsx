import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemDetailsPage from './ItemDetailsPage';

// Mock Services
vi.mock('../services/ItemService', () => ({
  default: { 
    getItemById: vi.fn(() => Promise.resolve({ 
      id: 1, 
      name: "Test Item", 
      pricePerDay: 20,
      reviews: [], // Ensure reviews exists for the map function
      owner: { id: 999 } // Different from auth user (id: 123)
    })),
    addReview: vi.fn(() => Promise.resolve({ id: 1, comment: "Saved!" }))
  }
}));
vi.mock('../services/BookingService', () => ({
  default: { createBooking: vi.fn(() => Promise.resolve({})) }
}));

// Mock Auth Context (Crucial!)
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 123, name: "Test User" }
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => vi.fn()
  };
});

describe('ItemDetailsPage', () => {
  it('renders item details', async () => {
    render(
      <MemoryRouter>
        <ItemDetailsPage />
      </MemoryRouter>
    );

    // Wait for data to load
    await waitFor(() => {
        screen.getByText("Test Item");
    });
  });
});

it('submits a review successfully', async () => {
  render(
    <MemoryRouter>
      <ItemDetailsPage />
    </MemoryRouter>
  );

  // Wait for item to load
  const commentBox = await screen.findByPlaceholderText(/write your experience/i);
  
  fireEvent.change(commentBox, { target: { value: 'Best surfboard ever!' } });
  fireEvent.click(screen.getByText('Submit Review'));

  await waitFor(() => {
    expect(screen.getByText('Best surfboard ever!')).toBeInTheDocument();
  });
});