import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ItemService from '../services/ItemService';
import BookingService from '../services/BookingService';
import { useAuth } from '../context/AuthContext';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

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
        startDate,
        endDate,
      };
      await BookingService.createBooking(bookingDTO);
      alert("Request sent! Waiting for owner approval.");
      navigate('/my-bookings');
    } catch (error) {
      console.error("Booking error", error);
      alert("Error creating booking.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) return alert("Login to review");
    if (!reviewText.trim()) return alert("Please write a comment.");

    try {
      const newReview = await ItemService.addReview(item.id, {
        reviewerId: user.id,
        rating: parseInt(rating),
        comment: reviewText,
      });

      setItem(prev => ({
        ...prev,
        reviews: [...(prev.reviews || []), newReview],
      }));

      setReviewText('');
      setRating(5);
      alert("Review added!");
    } catch (e) {
      alert("Failed to add review.");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!item) return <div className="text-center mt-5">Item not found</div>;

  const isOwner = user && item.owner && user.id === item.owner.id;

  return (
    <div className="container mt-5">
      <div className="row">
        {/* Image */}
        <div className="col-md-6">
          <img 
            src={item.imageUrl || "https://via.placeholder.com/600x400"} 
            className="img-fluid rounded shadow-sm" 
            alt={item.name} 
          />
        </div>

        {/* Details */}
        <div className="col-md-6">
          <h2>{item.name}</h2>
          <h4 className="text-primary">€{item.pricePerDay} / day</h4>
          <p className="text-muted mt-3">{item.description}</p>
          <p>
            <strong>Location:</strong> <span data-testid="location">{item.location}</span>
          </p>
          <p><strong>Condition:</strong> {item.condition}</p>

          <div className="card p-3 mt-4 bg-light shadow-sm border-0">
            {isOwner ? (
              <div className="alert alert-warning mb-0">
                You are the owner of this item.
              </div>
            ) : (
              <>
                <h5 className="mb-3">Request Booking</h5>
                <div className="mb-3">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input 
                    id="startDate"
                    type="date" 
                    className="form-control"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input 
                    id="endDate"
                    type="date" 
                    className="form-control"
                    value={endDate}
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

      {/* Reviews */}
      <div className="row mt-5 mb-5">
        <div className="col-12">
          <h3 className="border-bottom pb-2">Reviews</h3>
          <div className="mb-4">
            {item.reviews && item.reviews.length > 0 ? (
              item.reviews.map((r, idx) => (
                <div key={idx} className="card mb-2 p-3 border-0 bg-light">
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

          {!isOwner && user && (
            <div className="card p-3">
              <h5>Leave a Review</h5>
              <div className="mb-2">
                <label htmlFor="rating" className="form-label">Rating</label>
                <select 
                  id="rating" 
                  className="form-select" 
                  value={rating} 
                  onChange={e => setRating(e.target.value)}
                >
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="mb-2">
                <label htmlFor="comment" className="form-label">Comment</label>
                <textarea 
                  id="comment"
                  className="form-control" 
                  rows="3" 
                  placeholder="Write your experience..." 
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                />
              </div>
              <button className="btn btn-secondary" onClick={handleReviewSubmit}>
                Submit Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;
