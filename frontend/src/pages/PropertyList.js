import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PropertyCard from '../components/PropertyCard';

export default function PropertyList() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [city, setCity] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (city) params.set('city', city);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    api
      .get('/api/properties?' + params.toString())
      .then((res) => setProperties(res.data))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [search, type, city, minPrice, maxPrice]);

  return (
    <div className="page-transition-enter-active">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-end mb-5 fade-in-up">
          <div>
            <h2 className="display-6 fw-bold mb-2">Browse Properties</h2>
            <p className="text-muted mb-0 fs-5">Find the perfect place to call home.</p>
          </div>
        </div>

        <Row>
          <Col lg={3} className="mb-4 mb-lg-0 fade-in-up">
            <div className="glass-panel p-4 sticky-lg-top" style={{ top: '100px', zIndex: 10 }}>
              <div className="d-flex align-items-center mb-4 pb-3 border-bottom border-light" style={{ borderColor: 'var(--border-color) !important' }}>
                <span className="fs-4 me-2">🎛️</span>
                <h5 className="mb-0 fw-bold">Filters</h5>
              </div>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Location or title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="py-2 bg-dark text-light border-secondary"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Property Type</Form.Label>
                <Form.Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="py-2 bg-dark text-light border-secondary"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="villa">Villa</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">City</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. New York"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="py-2 bg-dark text-light border-secondary"
                />
              </Form.Group>

              <Row>
                <Col xs={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Min Price</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="₹0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="py-2 bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>
                <Col xs={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="text-muted small fw-bold text-uppercase tracking-wider mb-2">Max Price</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="Any"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="py-2 bg-dark text-light border-secondary"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                variant="outline-secondary"
                className="w-100 rounded-pill mb-2"
                onClick={() => { setSearch(''); setType(''); setCity(''); setMinPrice(''); setMaxPrice(''); }}
              >
                Clear Filters
              </Button>

              {user && (
                <Button
                  as={Link}
                  to="/my-listings"
                  variant="primary"
                  className="w-100 rounded-pill"
                >
                  View My Listings
                </Button>
              )}
            </div>
          </Col>

          <Col lg={9} className="fade-in-up-delayed">
            {loading ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 py-5 min-vh-50">
                <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-4 text-muted fs-5">Loading properties...</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="glass-panel text-center py-5 px-4 h-100 d-flex flex-column justify-content-center align-items-center">
                <div className="display-1 mb-4 opacity-50">🏜️</div>
                <h3 className="fw-bold mb-2">No properties found</h3>
                <p className="text-muted fs-5 max-w-md mx-auto">We couldn't find any properties matching your current filters. Try adjusting them or clearing your search.</p>
                <Button
                  variant="outline-primary"
                  className="mt-4 rounded-pill px-4"
                  onClick={() => { setSearch(''); setType(''); setCity(''); setMinPrice(''); setMaxPrice(''); }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <Row xs={1} md={2} xl={3} className="g-4">
                {properties.map((p) => (
                  <Col key={p._id}>
                    <PropertyCard property={p} />
                  </Col>
                ))}
              </Row>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}
