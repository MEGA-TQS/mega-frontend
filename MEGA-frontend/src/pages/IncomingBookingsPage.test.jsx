import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import IncomingBookingsPage from './IncomingBookingsPage';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

// 1. Mock the BookingService
vi.mock('../services/BookingService', () => ({
    default: {
        getIncomingBookings: vi.fn(),
        acceptBooking: vi.fn(),
        declineBooking: vi.fn()
    }
}));

// 2. Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('IncomingBookingsPage', () => {
    const mockUser = { id: 1, name: 'Owner User' };
    const mockBookings = [
        {
            id: 101,
            status: 'PENDING',
            startDate: '2025-01-01',
            endDate: '2025-01-05',
            renter: { name: 'Alice Renter' },
            items: [{ item: { name: 'Pro Surfboard' } }]
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation
        useAuth.mockReturnValue({ user: mockUser });
        BookingService.getIncomingBookings.mockResolvedValue(mockBookings);
    });

    it('renders the page title and table headers', async () => {
        render(
            <BrowserRouter>
                <IncomingBookingsPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Manage Incoming Bookings')).toBeInTheDocument();
        expect(screen.getByText('Item')).toBeInTheDocument();
        expect(screen.getByText('Renter')).toBeInTheDocument();
    });

    it('fetches and displays incoming bookings on load', async () => {
        render(
            <BrowserRouter>
                <IncomingBookingsPage />
            </BrowserRouter>
        );

        // Verify service was called with correct owner ID
        expect(BookingService.getIncomingBookings).toHaveBeenCalledWith(mockUser.id);

        // Wait for data to appear in the table
        await waitFor(() => {
            expect(screen.getByText('Pro Surfboard')).toBeInTheDocument();
            expect(screen.getByText('Alice Renter')).toBeInTheDocument();
            expect(screen.getByText('PENDING')).toBeInTheDocument();
        });
    });

    it('calls acceptBooking and refreshes the list when Accept is clicked', async () => {
        BookingService.acceptBooking.mockResolvedValue({});
        
        render(
            <BrowserRouter>
                <IncomingBookingsPage />
            </BrowserRouter>
        );

        const acceptBtn = await screen.findByText('Accept');
        fireEvent.click(acceptBtn);

        // Verify the accept call
        expect(BookingService.acceptBooking).toHaveBeenCalledWith(101);

        // Verify the list was refreshed
        await waitFor(() => {
            expect(BookingService.getIncomingBookings).toHaveBeenCalledTimes(2);
        });
    });

    it('calls declineBooking and refreshes the list when Decline is clicked', async () => {
        BookingService.declineBooking.mockResolvedValue({});
        
        render(
            <BrowserRouter>
                <IncomingBookingsPage />
            </BrowserRouter>
        );

        const declineBtn = await screen.findByText('Decline');
        fireEvent.click(declineBtn);

        // Verify the decline call
        expect(BookingService.declineBooking).toHaveBeenCalledWith(101);

        // Verify the list was refreshed
        await waitFor(() => {
            expect(BookingService.getIncomingBookings).toHaveBeenCalledTimes(2);
        });
    });

    it('handles empty booking list gracefully', async () => {
        BookingService.getIncomingBookings.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <IncomingBookingsPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            const rows = screen.queryAllByRole('row');
            // Only the header row should exist
            expect(rows.length).toBe(1);
        });
    });
});