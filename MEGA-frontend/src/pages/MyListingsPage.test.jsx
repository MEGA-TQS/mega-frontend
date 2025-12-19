import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MyListingsPage from './MyListingsPage'

// Mock services and context
vi.mock('../services/ItemService', () => ({
  default: {
    getMyListings: vi.fn(() => Promise.resolve([
      { id: 1, name: 'Bike', pricePerDay: 10, active: true }
    ])),
    deleteItem: vi.fn(() => Promise.resolve({})),
    updatePrice: vi.fn(() => Promise.resolve({ id: 1, pricePerDay: 15 }))
  }
}));

describe('MyListingsPage Actions', () => {
  it('updates price locally when Edit Price is clicked', async () => {
    // Mock window.prompt
    vi.spyOn(window, 'prompt').mockReturnValue('15');
    
    render(
      <BrowserRouter>
        <MyListingsPage />
      </BrowserRouter>
    );

    const editBtn = await screen.findByText('Edit Price');
    fireEvent.click(editBtn);

    await waitFor(() => {
      expect(screen.getByText(/Bike - €15/)).toBeInTheDocument();
    });
  });
});