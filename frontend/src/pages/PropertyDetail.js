import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, addDays, isBefore } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Booking Form State
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');

  // Availability State
  const [reservedIntervals, setReservedIntervals] = useState([]);
  const [nextAvailableDate, setNextAvailableDate] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propRes, datesRes] = await Promise.all([
          api.get(`/api/properties/${id}`),
          api.get(`/api/bookings/property/${id}/reserved-dates`)
        ]);

        setProperty(propRes.data);

        // Process reserved dates into intervals and identify next availability
        const intervals = datesRes.data.map(d => ({
          start: startOfDay(parseISO(d.checkIn)),
          end: startOfDay(parseISO(d.checkOut))
        })).sort((a, b) => a.start - b.start);

        setReservedIntervals(intervals);

        // Check if currently occupied and calculate next available day
        const today = startOfDay(new Date());
        let currentOccupied = intervals.find(interval =>
          isWithinInterval(today, { start: interval.start, end: interval.end })
        );

        if (currentOccupied) {
          // If occupied right now, the next available date is the checkOut of this block (or potentially later if back-to-back blocks exist)
          let available = currentOccupied.end;
          for (let i = 0; i < intervals.length; i++) {
            if (isBefore(intervals[i].start, addDays(available, 1)) && !isBefore(intervals[i].end, available)) {
              available = intervals[i].end;
            }
          }
          setNextAvailableDate(available);
        }

        const params = new URLSearchParams(location.search);
        if (params.get('book') === 'true') {
          const isOwner = user && propRes.data.owner?._id === user._id;
          if (user && propRes.data.status === 'approved' && !isOwner) {
            setShowBook(true);
          }
        }
      } catch (err) {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.search, user]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }

    // Double check that the selected interval doesn't encapsulate a booked date
    const encapsulatesBooked = reservedIntervals.some(interval =>
      isWithinInterval(interval.start, { start: checkIn, end: checkOut })
    );

    if (encapsulatesBooked) {
      setError('Your selected dates include days that are already booked. Please choose a different range.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        propertyId: id,
        checkIn: format(checkIn, 'yyyy-MM-dd'),
        checkOut: format(checkOut, 'yyyy-MM-dd'),
        guests,
        message,
      });
      setShowBook(false);
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center min-vh-50 d-flex flex-column justify-content-center">
        <Spinner animation="border" variant="primary" className="mx-auto mb-3" />
        <p className="text-muted">Loading property details...</p>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="py-5 text-center">
        <h3 className="text-white mb-3">Property not found.</h3>
        <Button as={Link} to="/properties" variant="outline-light">Back to listings</Button>
      </Container>
    );
  }

  // Setup image gallery array with fallbacks
  const images = property.images?.length > 0 ? property.images : [property.image || 'https://via.placeholder.com/800x400?text=No+Image'];
  const galleryImages = [
    images[0],
    images[1] || 'https://via.placeholder.com/400x300?text=Interior+1',
    images[2] || 'https://via.placeholder.com/400x300?text=Interior+2',
    images[3] || 'https://via.placeholder.com/400x300?text=Interior+3',
    images[4] || 'https://via.placeholder.com/400x300?text=Interior+4',
  ];

  const isOwner = user && property.owner?._id === user._id;
  const canBook = user && property.status === 'approved' && !isOwner;

  return (
    <div className="page-transition-enter-active">
      {/* Fix datepicker z-index and styles for dark mode */}
      <style>{`
        .react-datepicker-wrapper { width: 100%; }
        .react-datepicker__input-container input { 
          width: 100%; 
          background: transparent; 
          border: none; 
          color: white; 
          outline: none; 
          font-size: 0.9rem;
          cursor: pointer;
        }
        .react-datepicker {
          background-color: #1e293b;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          border-radius: 12px;
          overflow: hidden;
          font-family: inherit;
        }
        .react-datepicker__header {
          background-color: #0f172a;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header, .react-datepicker__day-name {
          color: white;
        }
        .react-datepicker__day { color: #cbd5e1; border-radius: 50%; }
        .react-datepicker__day:hover { background-color: rgba(99,102,241,0.2); color: white; }
        .react-datepicker__day--disabled { color: #475569 !important; text-decoration: line-through; cursor: not-allowed; }
        .react-datepicker__day--selected, .react-datepicker__day--in-selecting-range, .react-datepicker__day--in-range {
          background-color: #6366f1 !important;
          color: white !important;
        }
        .booking-input.form-control, .booking-input.form-control:focus {
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          color: white !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
      `}</style>

      <Container className="py-4">
        {/* Image Gallery */}
        <div className="mb-4 d-none d-lg-flex gap-2 fade-in-up" style={{ height: '450px' }}>
          <div className="w-50 h-100 position-relative overflow-hidden" style={{ borderTopLeftRadius: '1.5rem', borderBottomLeftRadius: '1.5rem' }}>
            <img src={galleryImages[0]} alt="Main" className="w-100 h-100 object-fit-cover card-hover transition-transform" />
          </div>
          <div className="w-50 h-100 d-flex flex-column gap-2">
            <div className="d-flex w-100 h-50 gap-2">
              <div className="w-50 h-100 position-relative overflow-hidden"><img src={galleryImages[1]} alt="Gallery 2" className="w-100 h-100 object-fit-cover card-hover transition-transform" /></div>
              <div className="w-50 h-100 position-relative overflow-hidden" style={{ borderTopRightRadius: '1.5rem' }}><img src={galleryImages[2]} alt="Gallery 3" className="w-100 h-100 object-fit-cover card-hover transition-transform" /></div>
            </div>
            <div className="d-flex w-100 h-50 gap-2">
              <div className="w-50 h-100 position-relative overflow-hidden"><img src={galleryImages[3]} alt="Gallery 4" className="w-100 h-100 object-fit-cover card-hover transition-transform" /></div>
              <div className="w-50 h-100 position-relative overflow-hidden" style={{ borderBottomRightRadius: '1.5rem' }}><img src={galleryImages[4]} alt="Gallery 5" className="w-100 h-100 object-fit-cover card-hover transition-transform" /></div>
            </div>
          </div>
        </div>

        {/* Mobile Gallery Fallback */}
        <div className="mb-4 d-lg-none fade-in-up" style={{ height: '300px' }}>
          <img src={galleryImages[0]} alt="Main" className="w-100 h-100 object-fit-cover rounded-4" />
        </div>

        <Row className="g-5">
          <Col lg={8} className="fade-in-up-delayed">
            {/* Title & Location */}
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h1 className="fw-bold text-white mb-0 display-6">{property.title}</h1>
              <Badge bg={property.status === 'approved' ? 'success' : property.status === 'pending' ? 'warning' : 'danger'} className="px-3 py-2 rounded-pill shadow-sm text-uppercase tracking-wider">
                {property.status}
              </Badge>
            </div>
            <p className="text-muted fs-5 mb-5">{property.location}{property.city ? `, ${property.city}` : ''}</p>

            {/* Next Available Indicator if currently occupied */}
            {nextAvailableDate && (
              <div className="mb-5 p-4 rounded-4" style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <div className="d-flex align-items-center gap-3">
                  <div className="fs-1">📅</div>
                  <div>
                    <h5 className="text-warning mb-1 fw-bold">Currently Occupied</h5>
                    <p className="text-muted mb-0">This property is currently booked. It will next be available starting <strong className="text-white">{format(nextAvailableDate, 'MMMM d, yyyy')}</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Boxes */}
            <Row className="g-3 mb-5">
              <Col xs={6} md={3}>
                <div className="glass-panel p-3 text-center h-100 border border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
                  <p className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Bedroom</p>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="fs-5 opacity-75">🛏️</span>
                    <span className="fw-bold text-white fs-5">{property.bedrooms}</span>
                  </div>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="glass-panel p-3 text-center h-100 border border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
                  <p className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Bathroom</p>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="fs-5 opacity-75">🚿</span>
                    <span className="fw-bold text-white fs-5">{property.bathrooms}</span>
                  </div>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="glass-panel p-3 text-center h-100 border border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
                  <p className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Area</p>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="fs-5 opacity-75">📐</span>
                    <span className="fw-bold text-white fs-5">{property.area || 'N/A'}{property.area ? ' sqft' : ''}</span>
                  </div>
                </div>
              </Col>
              <Col xs={6} md={3}>
                <div className="glass-panel p-3 text-center h-100 border border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
                  <p className="text-muted small fw-bold text-uppercase mb-2 tracking-wider">Type</p>
                  <div className="d-flex align-items-center justify-content-center gap-2">
                    <span className="fs-5 opacity-75">🏡</span>
                    <span className="fw-bold text-white fs-5 text-capitalize">{property.type}</span>
                  </div>
                </div>
              </Col>
            </Row>

            {/* Description */}
            <h4 className="fw-bold text-white mb-3">Description</h4>
            <div className="text-muted mb-5 fs-5" style={{ lineHeight: '1.8' }}>
              {property.description}
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="mb-5 border-top border-secondary pt-5" style={{ borderColor: 'var(--border-color) !important' }}>
                <h4 className="fw-bold text-white mb-4">What this place offers</h4>
                <Row className="g-3">
                  {property.amenities.map((amenity, idx) => (
                    <Col xs={6} md={4} key={idx}>
                      <div className="d-flex align-items-center text-light">
                        <span className="text-primary me-2">✓</span> {amenity}
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            {/* Host Info */}
            <div className="mb-5 border-top border-secondary pt-5" style={{ borderColor: 'var(--border-color) !important' }}>
              <h4 className="fw-bold text-white mb-4">Meet your host</h4>
              <div className="glass-panel p-4 d-flex align-items-center gap-4 border-0">
                <div className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white fw-bold display-6 shadow" style={{ width: '80px', height: '80px' }}>
                  {property.owner?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="fw-bold text-white mb-1">{property.owner?.name}</h4>
                  <p className="text-muted mb-2">Superhost · Verified</p>
                  <div className="d-flex flex-wrap gap-3 mt-2">
                    {property.owner?.email && (
                      <div className="d-flex align-items-center text-muted small">
                        <span className="me-2">✉️</span> {property.owner.email}
                      </div>
                    )}
                    {property.owner?.phone && (
                      <div className="d-flex align-items-center text-muted small">
                        <span className="me-2">📞</span> {property.owner.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={4} className="fade-in-up-delayed">
            {/* Sticky Booking Widget */}
            <div className="glass-panel p-4 sticky-lg-top border-0 shadow-lg" style={{ top: '100px' }}>
              <div className="d-flex align-items-baseline mb-4">
                <h3 className="fw-bolder text-white mb-0">₹{property.price.toLocaleString('en-IN')}</h3>
                <span className="text-muted ms-2 fs-5">/ day</span>
              </div>

              <Form onSubmit={handleBook}>
                <div className="border border-secondary rounded-4 mb-4" style={{ borderColor: 'rgba(255,255,255,0.1) !important', background: 'rgba(0,0,0,0.2)' }}>
                  <div className="d-flex border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>

                    {/* Check In Datepicker */}
                    <div className="w-50 p-3 border-end border-secondary position-relative" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                      <label className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Check In</label>
                      <DatePicker
                        selected={checkIn}
                        onChange={(date) => setCheckIn(date)}
                        selectsStart
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={new Date()}
                        excludeDateIntervals={reservedIntervals}
                        placeholderText="Select date"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>

                    {/* Check Out Datepicker */}
                    <div className="w-50 p-3 position-relative">
                      <label className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Check Out</label>
                      <DatePicker
                        selected={checkOut}
                        onChange={(date) => setCheckOut(date)}
                        selectsEnd
                        startDate={checkIn}
                        endDate={checkOut}
                        minDate={checkIn || new Date()}
                        excludeDateIntervals={reservedIntervals}
                        placeholderText="Select date"
                        dateFormat="MMM d, yyyy"
                      />
                    </div>
                  </div>

                  <div className="p-3 border-bottom border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                    <label className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Guests</label>
                    <Form.Control type="number" min="1" value={guests} onChange={(e) => setGuests(e.target.value)} required className="booking-input outline-none" style={{ fontSize: '0.95rem' }} />
                  </div>
                  <div className="p-3">
                    <label className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>Message to Host (Optional)</label>
                    <Form.Control as="textarea" rows="2" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Hi, I'm interested..." className="booking-input outline-none" style={{ fontSize: '0.95rem', resize: 'none' }} />
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-white mb-2">Cancellation Policies</h6>
                  <div className="p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="small text-muted mb-0">Free cancellation for 48 hours. After that, the reservation is non-refundable.</p>
                  </div>
                </div>

                {error && <div className="mb-3"><AlertMessage variant="danger" message={error} onClose={() => setError('')} /></div>}

                {canBook ? (
                  <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5 btn-hover-effect text-white shadow-lg" disabled={submitting}>
                    {submitting ? <Spinner size="sm" /> : 'Reserve'}
                  </Button>
                ) : isOwner ? (
                  <Button as={Link} to={`/properties/${id}/edit`} variant="secondary" className="w-100 py-3 rounded-pill fw-bold fs-5 btn-hover-effect">
                    Edit Listing
                  </Button>
                ) : !user ? (
                  <Button as={Link} to="/login" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5 btn-hover-effect text-white">
                    Log in to Reserve
                  </Button>
                ) : (
                  <Button variant="outline-secondary" className="w-100 py-3 rounded-pill fw-bold fs-5" disabled>
                    Not Available
                  </Button>
                )}
              </Form>

              <div className="mt-4 text-center">
                <p className="text-muted small mb-0">You won't be charged yet</p>
                {checkIn && checkOut && (
                  <>
                    <div className="d-flex justify-content-between mb-2 text-muted small">
                      <span>₹{property.price.toLocaleString('en-IN')} x {Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))} days</span>
                      <span>₹{(property.price * Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="d-flex justify-content-between mt-3 pt-3 text-light border-top border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                      <span className="fw-bold">Total before taxes</span>
                      <span className="fw-bold">₹{(property.price * Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)))).toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
