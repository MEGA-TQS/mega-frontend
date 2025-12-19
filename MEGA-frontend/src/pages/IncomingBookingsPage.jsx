import React, { useEffect, useState } from 'react';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

const IncomingBookingsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (user) {
            BookingService.getIncomingBookings(user.id)
                .then(data => setBookings(data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const handleAction = async (id, action) => {
        try {
            if (action === 'accept') {
                await BookingService.acceptBooking(id); // New name
            } else {
                await BookingService.declineBooking(id); // New name
            }
            
            // Refresh list
            const updated = await BookingService.getIncomingBookings(user.id);
            setBookings(updated);
        } catch (error) {
            alert("Action failed");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Manage Incoming Bookings</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Renter</th>
                        <th>Dates</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b.id}>
                            <td>{b.items[0]?.item?.name || "Unknown Item"}</td>
                            <td>{b.renter.name}</td>
                            <td>{b.startDate} to {b.endDate}</td>
                            <td>
                                <span className={`badge ${b.status === 'APPROVED' ? 'bg-success' : b.status === 'PENDING' ? 'bg-warning' : 'bg-secondary'}`}>
                                    {b.status}
                                </span>
                            </td>
                            <td>
                                {b.status === 'PENDING' && (
                                    <>
                                        <button className="btn btn-success btn-sm me-2" onClick={() => handleAction(b.id, 'accept')}>Accept</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(b.id, 'decline')}>Decline</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
export default IncomingBookingsPage;