import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemService from '../services/ItemService';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext'; // Import Auth

const ItemDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Get Real User
    const [item, setItem] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        ItemService.getAllItems().then(items => {
            const found = items.find(i => i.id === parseInt(id));
            setItem(found);
        });
    }, [id]);

    const handleRequest = async () => {
        if (!user) {
            alert("Please login to book items.");
            navigate('/login');
            return;
        }

        try {
            const bookingDTO = {
                renterId: user.id, // FIX: Use real ID from context
                itemIds: [item.id],
                startDate: startDate,
                endDate: endDate
            };
            await BookingService.createBooking(bookingDTO);
            alert("Request sent! Waiting for owner approval.");
            navigate('/my-bookings');
        } catch {
            alert("Error creating booking. Check console.");
        }
    };

    if (!item) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6">
                    <img src={item.imageUrl || "https://via.placeholder.com/600x400"} className="img-fluid rounded" alt={item.name} />
                </div>
                <div className="col-md-6">
                    <h2>{item.name}</h2>
                    <h4 className="text-primary">€{item.pricePerDay} / day</h4>
                    <p className="text-muted">{item.description}</p>
                    
                    <div className="card p-3 mt-4 bg-light">
                        <h5>Request Booking</h5>
                        <div className="mb-3">
                            <label>Start Date</label>
                            <input type="date" className="form-control" onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label>End Date</label>
                            <input type="date" className="form-control" onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <button className="btn btn-primary w-100" onClick={handleRequest}>
                            Send Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;