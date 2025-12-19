import React, { useEffect, useState } from 'react';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

const OwnerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const { user } = useAuth();

    const loadRequests = () => {
        if (user) {
            // FIX: Use real ID
            BookingService.getOwnerBookings(user.id) 
                .then(data => setRequests(data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        loadRequests();
    }, [user]);

    const handleStatus = (bookingId, isApproved) => {
        BookingService.updateStatus(bookingId, user.id, isApproved)
            .then(() => {
                loadRequests(); 
            });
    };

    return (
        <div className="container mt-4">
            <h2>Owner Dashboard</h2>
            <div className="list-group mt-3">
                {requests.map(booking => (
                    <div key={booking.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h5>Booking #{booking.id}</h5>
                            <p className="mb-1">Dates: {booking.startDate} to {booking.endDate}</p>
                            <p>Status: <span className={`badge bg-${booking.status === 'PENDING' ? 'warning' : booking.status === 'APPROVED' ? 'success' : 'secondary'}`}>{booking.status}</span></p>
                        </div>
                        
                        {booking.status === 'PENDING' && (
                            <div>
                                <button className="btn btn-success me-2" onClick={() => handleStatus(booking.id, true)}>Accept</button>
                                <button className="btn btn-outline-danger" onClick={() => handleStatus(booking.id, false)}>Decline</button>
                            </div>
                        )}
                    </div>
                ))}
                {requests.length === 0 && <p>No booking requests found.</p>}
            </div>
        </div>
    );
};

export default OwnerDashboard;