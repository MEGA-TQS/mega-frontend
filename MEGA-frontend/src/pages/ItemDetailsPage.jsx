import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemService from '../services/ItemService';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

const ItemDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    // State for Item
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State for Booking
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // State for Reviews
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);

    // Fetch Item Data
    useEffect(() => {
        ItemService.getItemById(id)
            .then(data => {
                setItem(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load item", err);
                setLoading(false);
            });
    }, [id]);

    // --- 1. HANDLE BOOKING REQUEST (The missing function) ---
    const handleRequest = async () => {
        if (!user) {
            alert("Please login to book items.");
            navigate('/login');
            return;
        }

        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        try {
            const bookingDTO = {
                renterId: user.id, 
                itemIds: [item.id],
                startDate: startDate,
                endDate: endDate
            };
            
            await BookingService.createBooking(bookingDTO);
            alert("Request sent! Waiting for owner approval.");
            navigate('/my-bookings'); // Redirect to user's booking history
        } catch (error) {
            console.error("Booking error", error);
            alert("Error creating booking. Check console for details.");
        }
    };

    const handleReviewSubmit = async () => {
        if (!user) return alert("Login to review");
        if (!reviewText.trim()) return alert("Please write a comment.");

        try {
            const newReview = await ItemService.addReview(item.id, {
                reviewerId: user.id,
                rating: parseInt(rating),
                comment: reviewText
            });

            // Update UI with the new review
            setItem(prevItem => ({
                ...prevItem,
                reviews: [...(prevItem.reviews || []), newReview]
            }));

            // --- THE FIX: RESET FORM ---
            setReviewText(""); 
            setRating(5); 
            alert("Review added!");
            
        } catch (e) {
            alert("Failed to add review. You might have already reviewed this item.");
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!item) return <div className="text-center mt-5">Item not found</div>;

    // Check if current user is the owner
    const isOwner = user && item.owner && user.id === item.owner.id;

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Image Section */}
                <div className="col-md-6">
                    <img 
                        src={item.imageUrl || "https://via.placeholder.com/600x400"} 
                        className="img-fluid rounded shadow-sm" 
                        alt={item.name} 
                    />
                </div>

                {/* Details Section */}
                <div className="col-md-6">
                    <h2>{item.name}</h2>
                    <h4 className="text-primary">€{item.pricePerDay} / day</h4>
                    <p className="text-muted mt-3">{item.description}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Condition:</strong> {item.condition}</p>
                    
                    {/* BOOKING CARD */}
                    <div className="card p-3 mt-4 bg-light shadow-sm border-0">
                        {isOwner ? (
                            <div className="alert alert-warning mb-0">
                                You are the owner of this item.
                            </div>
                        ) : (
                            <>
                                <h5 className="mb-3">Request Booking</h5>
                                <div className="mb-3">
                                    <label className="form-label">Start Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        onChange={e => setStartDate(e.target.value)} 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">End Date</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        onChange={e => setEndDate(e.target.value)} 
                                    />
                                </div>
                                <button className="btn btn-primary w-100" onClick={handleRequest}>
                                    Send Request
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className="row mt-5 mb-5">
                <div className="col-12">
                    <h3 className="border-bottom pb-2">Reviews</h3>
                    
                    {/* List Reviews */}
                    <div className="mb-4">
                        {item.reviews && item.reviews.length > 0 ? (
                            item.reviews.map((r, index) => (
                                <div key={index} className="card mb-2 p-3 border-0 bg-light">
                                    <div className="d-flex justify-content-between">
                                        <strong>{r.reviewer?.name || "User"}</strong>
                                        <span className="text-warning">{'★'.repeat(r.rating)}</span>
                                    </div>
                                    <p className="mb-0 mt-1 text-secondary">{r.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted">No reviews yet.</p>
                        )}
                    </div>

                    {/* Add Review Form (Only if logged in and NOT owner) */}
                    {!isOwner && user && (
                        <div className="card p-3">
                            <h5>Leave a Review</h5>
                            <div className="mb-2">
                                <label className="form-label">Rating</label>
                                <select className="form-select" value={rating} onChange={e => setRating(e.target.value)}>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <label className="form-label">Comment</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    placeholder="Write your experience..." 
                                    onChange={e => setReviewText(e.target.value)} 
                                />
                            </div>
                            <button className="btn btn-secondary" onClick={handleReviewSubmit}>Submit Review</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsPage;