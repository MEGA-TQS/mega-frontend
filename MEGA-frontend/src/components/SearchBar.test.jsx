import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from './SearchBar';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

import { useNavigate } from 'react-router-dom';

describe('SearchBar', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the search bar with all elements', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    // Check for form - query by class or tag
    const form = screen.getByRole('button', { name: 'Search' }).closest('form');
    expect(form).toBeTruthy();

    // Check for input fields
    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    expect(whatInput).toBeTruthy();
    expect(whereInput).toBeTruthy();

    // Check for search button
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeTruthy();
    expect(searchButton.className).toContain('btn');
    expect(searchButton.className).toContain('btn-primary');
    expect(searchButton.className).toContain('fw-bold');
    expect(searchButton.className).toContain('fs-5');
  });

  it('should update keyword input value correctly', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    fireEvent.change(whatInput, { target: { value: 'bicycle' } });
    
    expect(whatInput.value).toBe('bicycle');
  });

  it('should update location input value correctly', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whereInput = screen.getByLabelText('Where?');
    fireEvent.change(whereInput, { target: { value: 'Lisbon' } });
    
    expect(whereInput.value).toBe('Lisbon');
  });

  it('should handle form submission with both keyword and location', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    const searchButton = screen.getByText('Search');
    
    // Enter values
    fireEvent.change(whatInput, { target: { value: 'surfboard' } });
    fireEvent.change(whereInput, { target: { value: 'Costa da Caparica' } });
    
    // Submit form
    fireEvent.click(searchButton);
    
    // Should navigate to /browse with query params
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=surfboard&location=Costa da Caparica');
  });

  it('should handle form submission with only keyword', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const searchButton = screen.getByText('Search');
    
    // Enter only keyword
    fireEvent.change(whatInput, { target: { value: 'bike' } });
    
    // Submit form
    fireEvent.click(searchButton);
    
    // Should navigate to /browse with only keyword param
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=bike&location=');
  });

  it('should handle form submission with only location', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whereInput = screen.getByLabelText('Where?');
    const searchButton = screen.getByText('Search');
    
    // Enter only location
    fireEvent.change(whereInput, { target: { value: 'Porto' } });
    
    // Submit form
    fireEvent.click(searchButton);
    
    // Should navigate to /browse with only location param
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=&location=Porto');
  });

  it('should handle form submission with empty inputs', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const searchButton = screen.getByText('Search');
    
    // Submit form without entering anything
    fireEvent.click(searchButton);
    
    // Should navigate to /browse with empty params
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=&location=');
  });

  it('should handle form submission via Enter key', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    
    // Enter values
    fireEvent.change(whatInput, { target: { value: 'camera' } });
    fireEvent.change(whereInput, { target: { value: 'Lisbon' } });
    
    // Get the form
    const form = whatInput.closest('form');
    // Submit form by pressing Enter on keyword input
    fireEvent.submit(form);
    
    // Should navigate to /browse with query params
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=camera&location=Lisbon');
  });

  it('should handle special characters in search inputs', () => {
    render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    const searchButton = screen.getByText('Search');
    
    // Enter values with special characters
    fireEvent.change(whatInput, { target: { value: 'DJI & GoPro' } });
    fireEvent.change(whereInput, { target: { value: 'São Paulo, Brasil' } });
    
    // Submit form
    fireEvent.click(searchButton);
    
    // Should navigate with encoded special characters
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=DJI & GoPro&location=São Paulo, Brasil');
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    // Get the form element
    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    
    // Get the card element (parent of form)
    const card = form.closest('.card');
    expect(card).toBeTruthy();
    expect(card.className).toContain('card');
    expect(card.className).toContain('p-4');
    expect(card.className).toContain('shadow-lg');
    expect(card.className).toContain('border-0');
    
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input.className).toContain('form-control');
      expect(input.className).toContain('border-0');
      expect(input.className).toContain('bg-light');
    });
  });

  it('should maintain input values after rendering', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    
    // Enter values
    fireEvent.change(whatInput, { target: { value: 'test value' } });
    fireEvent.change(whereInput, { target: { value: 'test location' } });
    
    expect(whatInput.value).toBe('test value');
    expect(whereInput.value).toBe('test location');
    
    // Re-render the same component
    rerender(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
    
    // Get new references after re-render
    const newWhatInput = screen.getByLabelText('What are you looking for?');
    const newWhereInput = screen.getByLabelText('Where?');
    
    // The component should maintain its state because rerender updates the same component instance
    expect(newWhatInput.value).toBe('test value');
    expect(newWhereInput.value).toBe('test location');
  });
});