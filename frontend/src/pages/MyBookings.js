import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Card, Badge, Spinner, Button } from 'react-bootstrap';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('active'); // active, history, all
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/api/bookings/my')
      .then((res) => setBookings(res.data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  const statusVariant = (s) => (s === 'confirmed' ? 'success' : s === 'cancelled' ? 'danger' : s === 'completed' ? 'secondary' : 'warning');

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    setCancellingId(id);
    setError('');
    setSuccess('');

    try {
      await api.patch(`/api/bookings/${id}/cancel`);
      setSuccess('Booking cancelled successfully.');

      // Update local state without refetching all array
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const isCancellable = (booking) => {
    if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;

    // Check if check in date is in the future
    const now = new Date();
    const checkIn = new Date(booking.checkIn);

    // Set both to midnight to only compare the day
    now.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);

    return now < checkIn;
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'active') return b.status === 'pending' || b.status === 'confirmed';
    if (filter === 'history') return b.status === 'cancelled' || b.status === 'completed';
    return true; // all
  });

  if (loading && bookings.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <div className="page-transition-enter-active">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-4 fade-in-up">
          <div>
            <h2 className="display-6 fw-bold mb-2">My Bookings</h2>
            <p className="text-muted mb-0 fs-5">Manage your upcoming stays and past trips.</p>
          </div>
          {bookings.length > 0 && (
            <div className="d-flex bg-dark rounded-pill p-1 border border-secondary" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
              <Button
                variant={filter === 'active' ? 'primary' : 'transparent'}
                className={`rounded-pill px-4 py-2 border-0 ${filter !== 'active' ? 'text-muted' : 'fw-bold'}`}
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button
                variant={filter === 'history' ? 'primary' : 'transparent'}
                className={`rounded-pill px-4 py-2 border-0 ${filter !== 'history' ? 'text-muted' : 'fw-bold'}`}
                onClick={() => setFilter('history')}
              >
                History
              </Button>
              <Button
                variant={filter === 'all' ? 'primary' : 'transparent'}
                className={`rounded-pill px-4 py-2 border-0 ${filter !== 'all' ? 'text-muted' : 'fw-bold'}`}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
            </div>
          )}
        </div>

        {error && <AlertMessage variant="danger" message={error} onClose={() => setError('')} />}
        {success && <AlertMessage variant="success" message={success} onClose={() => setSuccess('')} />}

        <div className="glass-panel p-4 p-md-5 border-0 shadow-lg fade-in-up-delayed">
          {bookings.length === 0 ? (
            <div className="text-center py-5 my-5">
              <div className="display-1 mb-4 opacity-50">🏖️</div>
              <h3 className="fw-bold mb-3">No bookings yet</h3>
              <p className="text-muted fs-5 mb-4">You haven't booked any properties. Start exploring to find your perfect stay.</p>
              <Link to="/properties" className="btn btn-primary rounded-pill px-5 py-3 fs-5">
                Browse Properties
              </Link>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-5 my-5">
              <div className="display-4 text-muted mb-3">📭</div>
              <h4 className="fw-bold mb-2 text-white">No {filter} bookings</h4>
              <p className="text-muted mb-0">You don't have any bookings matching this filter.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0" variant="dark" style={{ backgroundColor: 'transparent' }}>
                <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <tr>
                    <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent">Property</th>
                    <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent">Dates</th>
                    <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-end">Amount</th>
                    <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-center">Status</th>
                    <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-3 bg-transparent border-0">
                        <Link to={`/properties/${b.property?._id}?book=true`} className="fw-bold text-light text-decoration-none d-block mb-1 fs-5 card-hover-text">
                          {b.property?.title}
                        </Link>
                        <span className="text-muted small">
                          <span className="me-1">📍</span>{b.property?.city}
                        </span>
                      </td>
                      <td className="py-3 bg-transparent border-0 text-light">
                        <div className="d-flex flex-column">
                          <span>{new Date(b.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-muted small">to</span>
                          <span>{new Date(b.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="py-3 bg-transparent border-0 text-light text-end fw-bold fs-5">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 bg-transparent border-0 text-center">
                        <Badge bg={statusVariant(b.status)} className="px-3 py-2 rounded-pill text-uppercase tracking-wider shadow-sm">
                          {b.status}
                        </Badge>
                      </td>
                      <td className="py-3 bg-transparent border-0 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Link to={`/properties/${b.property?._id}`} className="btn btn-sm btn-outline-secondary rounded-pill px-3">
                            View
                          </Link>
                          {isCancellable(b) && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-pill px-3"
                              onClick={() => handleCancel(b._id)}
                              disabled={cancellingId === b._id}
                            >
                              {cancellingId === b._id ? <Spinner size="sm" /> : 'Cancel'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
