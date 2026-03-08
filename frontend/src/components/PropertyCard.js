import React from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './PropertyCard.css'; // Optional: Add styles for the card

const PropertyCard = ({ property, onDelete }) => {
  const imgUrl = property.images && property.images.length > 0
    ? property.images[0]
    : (property.image || 'https://via.placeholder.com/400x300?text=No+Image');

  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = React.useState(false);

  const isOwner = user && property.owner && (property.owner._id === user._id || property.owner === user._id);
  const canBook = property.status === 'approved' && !isOwner;

  const handleQuickBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setSubmitting(true);

    // Default dates: tomorrow to day after tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    try {
      await api.post('/api/bookings', {
        propertyId: property._id,
        checkIn: tomorrow.toISOString().split('T')[0],
        checkOut: dayAfter.toISOString().split('T')[0],
        guests: 1,
        message: 'Quick booked from search.',
      });
      navigate('/my-bookings');
    } catch (err) {
      console.error('Quick booking failed:', err);
      // Fallback to property detail to show error if it fails
      navigate(`/properties/${property._id}?book=true`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel h-100 card-hover border-0 text-decoration-none d-flex flex-column">
      <div className="position-relative overflow-hidden" style={{ height: '220px' }}>
        <img
          src={imgUrl}
          alt={property.title}
          className="w-100 h-100 object-fit-cover transition-transform"
          style={{ transition: 'transform 0.3s ease' }}
          onMouseOver={React.useCallback((e) => e.currentTarget.style.transform = 'scale(1.05)', [])}
          onMouseOut={React.useCallback((e) => e.currentTarget.style.transform = 'scale(1)', [])}
        />
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge rounded-pill bg-primary px-3 py-2 shadow-sm">
            ₹{property.price.toLocaleString('en-IN')}/day
          </span>
        </div>
      </div>
      <div className="p-4 flex-grow-1 d-flex flex-column">
        <h4 className="fw-bold mb-2 text-truncate text-white">{property.title}</h4>
        <p className="text-muted small mb-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {property.description}
        </p>
        <div className="mt-auto pt-3 border-top border-secondary d-flex flex-column gap-2" style={{ borderColor: 'var(--border-color) !important' }}>
          {!isOwner ? (
            <div className="d-flex justify-content-between align-items-center gap-2">
              <Link to={`/properties/${property._id}`} className="btn btn-sm btn-secondary rounded-pill px-3 flex-grow-1 text-center">
                View Details
              </Link>
              {canBook && (
                <button onClick={handleQuickBook} disabled={submitting} className="btn btn-sm btn-primary rounded-pill px-3 flex-grow-1 text-center">
                  {submitting ? 'Booking...' : 'Book Now'}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex w-100 gap-2">
                <Link to={`/properties/${property._id}`} className="btn btn-sm btn-secondary rounded-pill px-3 flex-grow-1 text-center">View</Link>
                <Link to={`/properties/${property._id}/edit`} className="btn btn-sm btn-secondary rounded-pill px-3 flex-grow-1 text-center">Edit</Link>
              </div>
              <div className="d-flex w-100 gap-2">
                <Link to={`/properties/${property._id}/bookings`} className="btn btn-sm btn-primary rounded-pill px-3 flex-grow-1 text-center">Bookings</Link>
                <button onClick={() => { if (window.confirm('Are you sure you want to delete this listing?')) onDelete && onDelete(property._id) }} className="btn btn-sm btn-danger rounded-pill px-3 flex-grow-1 text-center">Delete</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    _id: PropTypes.string,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
  onDelete: PropTypes.func,
};

export default PropertyCard;