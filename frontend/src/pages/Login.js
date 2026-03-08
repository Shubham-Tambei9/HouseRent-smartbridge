import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      await login(data.token);
      navigate(data.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition-enter-active">
      <Container className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <Row className="justify-content-center w-100 mx-0">
          <Col md={6} lg={5}>
            <div className="glass-panel p-4 p-md-5 fade-in-up shadow-lg">
              <div className="text-center mb-4">
                <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '60px', height: '60px', background: 'var(--primary-soft)' }}>
                  <span className="fs-3">🔐</span>
                </div>
                <h2 className="fw-bold mb-1">Welcome Back</h2>
                <p className="text-muted">Sign in to continue to House Rent</p>
              </div>

              <AlertMessage variant="danger" message={error} onClose={() => setError('')} />

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="text-muted fw-bold text-uppercase small tracking-wider mb-0">Password</Form.Label>
                    <Link to="/forgot-password" className="small text-decoration-none" style={{ color: 'var(--primary)' }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="py-2"
                  />
                </Form.Group>

                <Button type="submit" className="btn-primary w-100 py-2 mb-4 fs-5" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form>

              <p className="text-center mb-0 text-muted">
                Don't have an account? <Link to="/register" className="fw-bold text-decoration-none">Create one</Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
