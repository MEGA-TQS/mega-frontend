import api from '../api/axiosConfig';

const BookingService = {
    // 1. Create a booking request
    // Matches: POST /api/bookings
    createBooking: async (bookingData) => {
        // bookingData: { renterId, itemIds: [], startDate, endDate }
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },

    // 2. Owner gets their incoming requests
    // Matches: GET /api/bookings/owner/{ownerId} (Visible in your Swagger)
    getIncomingBookings: async (ownerId) => {
        const response = await api.get(`/bookings/owner/${ownerId}`);
        return response.data;
    },

    // 3. Renter gets their history
    // Matches: GET /api/bookings/renter/{renterId} (Visible in your Swagger)
    getMyBookings: async (renterId) => {
        const response = await api.get(`/bookings/renter/${renterId}`);
        return response.data;
    },

    // 4. Owner Accepts a booking
    // Matches: PATCH /api/bookings/{id}/accept
    acceptBooking: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/accept`);
        return response.data;
    },

    // 5. Owner Declines a booking
    // Matches: PATCH /api/bookings/{id}/decline
    declineBooking: async (bookingId) => {
        const response = await api.patch(`/bookings/${bookingId}/decline`);
        return response.data;
    },

    payBooking: async (bookingId, amount) => {
        const paymentData = {
            bookingId: bookingId,
            amount: amount,
            paymentMethod: "CREDIT_CARD" // Mock method
        };
        const response = await api.post('/payments/pay', paymentData);
        return response.data;
    }
};

export default BookingService;