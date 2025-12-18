import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock categories
vi.mock('../constants/categories', () => ({
  CATEGORIES: [
    { name: 'Surf', img: 'surf.jpg' },
    { name: 'Camping', img: 'camping.jpg' }
  ]
}))

// Mock SearchBar component
vi.mock('../components/SearchBar', () => ({
  default: () => <div>Search Bar</div>
}))

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
  })
})