import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';

export default function ManagePropertyBookings() {
    const { id } = useParams();
    const [bookings, setBookings] = useState([]);
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch property details for the title
        api.get(`/api/properties/${id}`).then(res => setProperty(res.data)).catch(console.error);

        // Fetch incoming bookings for this property
        api.get(`/api/bookings/property/${id}`)
            .then((res) => setBookings(res.data))
            .catch((err) => setError('Failed to load bookings'))
            .finally(() => setLoading(false));
    }, [id]);

    const updateStatus = async (bookingId, newStatus) => {
        try {
            const { data } = await api.patch(`/api/bookings/${bookingId}/status`, { status: newStatus });
            setBookings((prev) => prev.map((b) => (b._id === bookingId ? data : b)));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const statusVariant = (s) => (s === 'confirmed' ? 'success' : s === 'cancelled' ? 'danger' : s === 'completed' ? 'secondary' : 'warning');

    if (loading) {
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
                        <Link to="/my-listings" className="text-secondary text-decoration-none mb-2 d-inline-block">&larr; Back to My Listings</Link>
                        <h2 className="display-6 fw-bold mb-2">Manage Bookings</h2>
                        <p className="text-muted mb-0 fs-5">{property ? `Requests for "${property.title}"` : 'Manage your received booking requests.'}</p>
                    </div>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}

                <div className="glass-panel p-4 p-md-5 border-0 shadow-lg fade-in-up-delayed">
                    {bookings.length === 0 ? (
                        <div className="text-center py-5 my-5">
                            <div className="display-1 mb-4 opacity-50">📬</div>
                            <h3 className="fw-bold mb-3">No bookings yet</h3>
                            <p className="text-muted fs-5 mb-0">Nobody has requested to book this property yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="align-middle mb-0" variant="dark" style={{ backgroundColor: 'transparent' }}>
                                <thead style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <tr>
                                        <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent">Guest</th>
                                        <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent">Dates</th>
                                        <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-center">Guests</th>
                                        <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-center">Status</th>
                                        <th className="text-muted text-uppercase tracking-wider fw-bold py-3 border-0 bg-transparent text-end">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td className="py-3 bg-transparent border-0">
                                                <div className="fw-bold text-light mb-1 fs-5">
                                                    {b.user?.name || 'Unknown User'}
                                                </div>
                                                <span className="text-muted small">
                                                    <span className="me-1">✉️</span>{b.user?.email || 'No email provided'}
                                                </span>
                                                {b.message && (
                                                    <div className="mt-2 text-info small fst-italic">
                                                        "{b.message}"
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 bg-transparent border-0 text-light">
                                                <div className="d-flex flex-column">
                                                    <span className="small text-muted mb-1">In: <span className="text-light fw-bold">{new Date(b.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></span>
                                                    <span className="small text-muted">Out: <span className="text-light fw-bold">{new Date(b.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></span>
                                                </div>
                                            </td>
                                            <td className="py-3 bg-transparent border-0 text-light text-center fw-bold fs-5">
                                                {b.guests}
                                            </td>
                                            <td className="py-3 bg-transparent border-0 text-center">
                                                <Badge bg={statusVariant(b.status)} className="px-3 py-2 rounded-pill text-uppercase tracking-wider shadow-sm">
                                                    {b.status === 'cancelled' ? 'rejected' : b.status}
                                                </Badge>
                                            </td>
                                            <td className="py-3 bg-transparent border-0 text-end">
                                                {b.status === 'pending' ? (
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <Button size="sm" variant="success" className="rounded-pill px-3 fw-bold" onClick={() => updateStatus(b._id, 'confirmed')}>Approve</Button>
                                                        <Button size="sm" variant="outline-danger" className="rounded-pill px-3 fw-bold" onClick={() => updateStatus(b._id, 'cancelled')}>Reject</Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted small fst-italic">No actions available</span>
                                                )}
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
