import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';

export default function MyListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/properties/my-listings').then((res) => setProperties(res.data)).catch(() => setProperties([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/properties/${id}`);
      setProperties(properties.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Listings</h2>
        <Button as={Link} to="/properties/add" variant="primary">
          Add Property
        </Button>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : properties.length === 0 ? (
        <p className="text-muted">You have no listings. <Link to="/properties/add">Add your first property</Link>.</p>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {properties.map((p) => (
            <Col key={p._id}>
              <PropertyCard property={p} onDelete={handleDelete} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
