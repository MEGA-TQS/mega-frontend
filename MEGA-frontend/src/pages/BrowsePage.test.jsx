import { describe, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BrowsePage from './BrowsePage'

// Mock dependencies
vi.mock('../services/ItemService', () => ({
  default: {
    searchItems: vi.fn(() => Promise.resolve([]))
  }
}))

vi.mock('../constants/categories', () => ({
  CATEGORIES: [
    { name: 'Surf', img: 'surf.jpg' },
    { name: 'Camping', img: 'camping.jpg' }
  ]
}))

// Mock useSearchParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  }
})

describe('BrowsePage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <BrowsePage />
      </BrowserRouter>
    )
  })
})