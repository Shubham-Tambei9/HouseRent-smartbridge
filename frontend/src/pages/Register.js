import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password, phone });
      await doRegister(data.token);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      setError(msg);
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
                  <span className="fs-3">✨</span>
                </div>
                <h2 className="fw-bold mb-1">Create Account</h2>
                <p className="text-muted">Join House Rent today</p>
              </div>

              <AlertMessage variant="danger" message={error} onClose={() => setError('')} />

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
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

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider">Phone (Optional)</Form.Label>
                  <Form.Control
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (234) 567-8900"
                    className="py-2"
                  />
                </Form.Group>

                <Button type="submit" className="btn-primary w-100 py-2 mb-4 fs-5" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
              </Form>

              <p className="text-center mb-0 text-muted">
                Already have an account? <Link to="/login" className="fw-bold text-decoration-none">Sign in</Link>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
