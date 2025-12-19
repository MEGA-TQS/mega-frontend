import React, { useEffect, useState } from 'react';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext'; // 1. Import Auth

const MyBookingsPage = () => {
    const { user } = useAuth(); // 2. Get real user
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            // 3. Use the correct new method name
            BookingService.getMyBookings(user.id)
                .then(data => setBookings(data))
                .catch(err => console.error("Error loading bookings:", err));
        }
    }, [user]);

    const handlePayment = async (bookingId, price) => {
        try {
            // 4. Call the service
            await BookingService.payBooking(bookingId, price);
            alert("Payment Successful! Booking is now PAID.");
            
            // 5. Refresh the list to see the status change
            const updated = await BookingService.getMyBookings(user.id);
            setBookings(updated);
        } catch (error) {
            console.error("Payment failed", error);
            alert("Payment failed. See console for details.");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="alert alert-info">You haven't made any bookings yet.</div>
            ) : (
                <div className="row">
                    {bookings.map(booking => (
                        <div key={booking.id} className="col-12 mb-3">
                            <div className="card shadow-sm">
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title">Booking #{booking.id}</h5>
                                        <p className="mb-1">
                                            <strong>Item:</strong> {booking.items?.[0]?.item?.name || "Unknown Item"}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Dates:</strong> {booking.startDate} to {booking.endDate}
                                        </p>
                                        <p className="mb-0">
                                            <strong>Total:</strong> €{booking.totalPrice}
                                        </p>
                                    </div>

                                    <div className="text-end">
                                        <div className="mb-2">
                                            <span className={`badge p-2 ${
                                                booking.status === 'APPROVED' ? 'bg-success' : 
                                                booking.status === 'PAID' ? 'bg-primary' : 
                                                booking.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        {/* 6. Show Button instead of Link */}
                                        {booking.status === 'APPROVED' && (
                                            <button 
                                                className="btn btn-dark btn-sm"
                                                onClick={() => handlePayment(booking.id, booking.totalPrice)}
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;