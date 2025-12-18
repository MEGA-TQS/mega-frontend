import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import { assertFormControl, assertButton } from './test-utils';

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

  const renderSearchBar = () => {
    return render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );
  };

  const getFormElements = () => ({
    form: screen.getByRole('button', { name: 'Search' }).closest('form'),
    whatInput: screen.getByLabelText('What are you looking for?'),
    whereInput: screen.getByLabelText('Where?'),
    searchButton: screen.getByText('Search'),
  });

  it('should render the search bar with all elements', () => {
    renderSearchBar();
    const { form, whatInput, whereInput, searchButton } = getFormElements();

    expect(form).toBeTruthy();
    expect(whatInput).toBeTruthy();
    expect(whereInput).toBeTruthy();
    assertButton(searchButton, ['btn-primary', 'fw-bold', 'fs-5']);
  });

  it('should update keyword input value correctly', () => {
    renderSearchBar();
    const { whatInput } = getFormElements();
    
    fireEvent.change(whatInput, { target: { value: 'bicycle' } });
    expect(whatInput.value).toBe('bicycle');
  });

  it('should update location input value correctly', () => {
    renderSearchBar();
    const { whereInput } = getFormElements();
    
    fireEvent.change(whereInput, { target: { value: 'Lisbon' } });
    expect(whereInput.value).toBe('Lisbon');
  });

  // Form submission tests using a helper
  const testFormSubmission = (keyword = '', location = '') => {
    renderSearchBar();
    const { whatInput, whereInput, searchButton } = getFormElements();
    
    if (keyword !== undefined) {
      fireEvent.change(whatInput, { target: { value: keyword } });
    }
    if (location !== undefined) {
      fireEvent.change(whereInput, { target: { value: location } });
    }
    
    fireEvent.click(searchButton);
    
    const expectedPath = `/browse?keyword=${keyword}&location=${location}`;
    expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
  };

  it('should handle form submission with both keyword and location', () => {
    testFormSubmission('surfboard', 'Costa da Caparica');
  });

  it('should handle form submission with only keyword', () => {
    testFormSubmission('bike', '');
  });

  it('should handle form submission with only location', () => {
    testFormSubmission('', 'Porto');
  });

  it('should handle form submission with empty inputs', () => {
    testFormSubmission('', '');
  });

  it('should handle form submission via Enter key', () => {
    renderSearchBar();
    const { whatInput, whereInput } = getFormElements();
    
    fireEvent.change(whatInput, { target: { value: 'camera' } });
    fireEvent.change(whereInput, { target: { value: 'Lisbon' } });
    
    const form = whatInput.closest('form');
    fireEvent.submit(form);
    
    expect(mockNavigate).toHaveBeenCalledWith('/browse?keyword=camera&location=Lisbon');
  });

  it('should handle special characters in search inputs', () => {
    renderSearchBar();
    const { whatInput, whereInput, searchButton } = getFormElements();
    
    fireEvent.change(whatInput, { target: { value: 'DJI & GoPro' } });
    fireEvent.change(whereInput, { target: { value: 'São Paulo, Brasil' } });
    
    fireEvent.click(searchButton);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/browse?keyword=DJI & GoPro&location=São Paulo, Brasil'
    );
  });

  it('should have proper styling classes', () => {
    const { container } = renderSearchBar();
    const { whatInput, whereInput } = getFormElements();

    const form = container.querySelector('form');
    const card = form.closest('.card');
    
    expect(card).toBeTruthy();
    ['card', 'p-4', 'shadow-lg', 'border-0'].forEach(className => {
      expect(card.className).toContain(className);
    });

    [whatInput, whereInput].forEach(input => assertFormControl(input));
  });

  it('should maintain input values after rendering', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SearchBar />
      </MemoryRouter>
    );

    const whatInput = screen.getByLabelText('What are you looking for?');
    const whereInput = screen.getByLabelText('Where?');
    
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
    
    expect(newWhatInput.value).toBe('test value');
    expect(newWhereInput.value).toBe('test location');
  });
});