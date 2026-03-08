import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function ResetPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const [email, setEmail] = useState(location.state?.email || '');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.put(`/api/auth/reset-password`, { email, otp, password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. OTP code may be invalid or expired.');
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
                        {success ? (
                            <div className="text-center fade-in-up">
                                <div className="mb-4 bg-success bg-gradient rounded-circle d-flex align-items-center justify-content-center mx-auto shadow-lg" style={{ width: '80px', height: '80px' }}>
                                    <FiCheckCircle size={40} color="white" />
                                </div>
                                <h2 className="fw-bolder text-white mb-3">Password Reset!</h2>
                                <p className="text-muted fs-5 mb-4">Your password has been changed securely.</p>
                                <p className="text-muted small">Redirecting you to login...</p>
                                <Link to="/login" className="btn btn-primary rounded-pill px-4 mt-2 shadow-lg btn-hover-effect">
                                    Go to Login Now
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center shadow-lg" style={{ width: '64px', height: '64px' }}>
                                    <FiLock size={28} color="white" />
                                </div>

                                <h2 className="fw-bolder text-white mb-2 text-center">Reset Password</h2>
                                <p className="text-muted text-center mb-4">Enter your new secure password below.</p>

                                <div className="w-100">
                                    {error && <div className="mb-3"><AlertMessage variant="danger" message={error} onClose={() => setError('')} /></div>}
                                </div>

                                <Form onSubmit={handleSubmit} className="w-100">
                                    <Form.Group className="mb-3" controlId="email">
                                        <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-2">Email Address</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your registered email"
                                            required
                                            className="py-3 px-4 shadow-sm"
                                            disabled={loading || location.state?.email}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="otp">
                                        <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-2">6-Digit Verification Code</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="e.g. 482915"
                                            required
                                            maxLength="6"
                                            className="py-3 px-4 shadow-sm text-center fw-bold text-primary"
                                            style={{ letterSpacing: '8px', fontSize: '1.2rem' }}
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="password">
                                        <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-2">New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Minimum 6 characters"
                                            required
                                            minLength="6"
                                            className="py-3 px-4 shadow-sm"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-4" controlId="confirmPassword">
                                        <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-2">Confirm New Password</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Type your password again"
                                            required
                                            minLength="6"
                                            className="py-3 px-4 shadow-sm"
                                            disabled={loading}
                                        />
                                    </Form.Group>

                                    <Button type="submit" variant="primary" className="w-100 py-3 rounded-pill fw-bold fs-5 shadow-lg btn-hover-effect" disabled={loading}>
                                        {loading ? <Spinner size="sm" animation="border" /> : 'Save Password'}
                                    </Button>
                                </Form>
                            </>
                        )}
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}
