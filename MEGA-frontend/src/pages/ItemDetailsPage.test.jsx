import { describe, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemDetailsPage from './ItemDetailsPage';

// Mock Services
vi.mock('../services/ItemService', () => ({
  default: { getAllItems: vi.fn(() => Promise.resolve([{ id: 1, name: "Test Item", pricePerDay: 20 }])) }
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