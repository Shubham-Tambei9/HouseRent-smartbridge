import { useState } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            setSuccess(res.data.message);

            // Navigate to reset password page and pass the email
            setTimeout(() => {
                navigate('/reset-password', { state: { email, showToast: true } });
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset link.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-transition-enter-active">
            <Container className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                <Card className="premium-innovative-card border-0 w-100" style={{ maxWidth: '450px' }}>
                    <div className="premium-innovative-card-bg"></div>

                    <Card.Body className="p-4 p-md-5 position-relative z-1 d-flex flex-column align-items-center">
                        <div className="mb-4 bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '64px', height: '64px' }}>
                            <FiMail size={28} color="white" />
                        </div>

                        <h2 className="fw-bolder text-white mb-2 text-center">Forgot Password?</h2>
                        <p className="text-muted text-center mb-4">No worries, we'll send you reset instructions.</p>

                        <div className="w-100">
                            {error && <div className="mb-3"><AlertMessage variant="danger" message={error} onClose={() => setError('')} /></div>}
                            {success && <div className="mb-3"><AlertMessage variant="success" message={success} onClose={() => setSuccess('')} /></div>}
                        </div>

                        <Form onSubmit={handleSubmit} className="w-100">
                            <Form.Group className="mb-4" controlId="email">
                                <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-2">Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    required
                                    className="py-3 px-4 shadow-sm"
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5 shadow-lg btn-hover-effect mb-4" disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border" /> : 'Reset Password'}
                            </Button>

                            <div className="text-center mt-3">
                                <Link to="/login" className="text-muted text-decoration-none d-flex align-items-center justify-content-center gap-2 link-hover">
                                    <FiArrowLeft /> Back to Log in
                                </Link>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}
