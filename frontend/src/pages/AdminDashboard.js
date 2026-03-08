import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import api from '../api/axios';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/properties/pending').then((r) => r.data),
      api.get('/api/bookings/admin').then((r) => r.data),
      api.get('/api/users').then((r) => r.data),
    ])
      .then(([p, b, u]) => {
        setPending(p);
        setBookings(b);
        setUsers(u);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = (id, status) => {
    api.patch('/api/properties/' + id + '/approve', { status }).then(() => {
      setPending((prev) => prev.filter((p) => p._id !== id));
    }).catch(() => { });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>Pending property approvals</strong> ({pending.length})
            </Card.Header>
            <Card.Body>
              {pending.length === 0 ? (
                <p className="text-muted mb-0">No pending listings.</p>
              ) : (
                <Table size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((p) => (
                      <tr key={p._id}>
                        <td>{p.title}</td>
                        <td>{p.owner?.name}</td>
                        <td>₹{p.price.toLocaleString('en-IN')}</td>
                        <td>
                          <Button size="sm" variant="success" className="me-1" onClick={() => handleApprove(p._id, 'approved')}>
                            Approve
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleApprove(p._id, 'rejected')}>
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6} className="mb-4">
          <Card>
            <Card.Header>
              <strong>Recent bookings</strong>
            </Card.Header>
            <Card.Body>
              {bookings.length === 0 ? (
                <p className="text-muted mb-0">No bookings.</p>
              ) : (
                <Table size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>User</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((b) => (
                      <tr key={b._id}>
                        <td>{b.property?.title}</td>
                        <td>{b.user?.name}</td>
                        <td><Badge bg="secondary">{b.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <strong>Users</strong> ({users.length})
            </Card.Header>
            <Card.Body>
              <Table size="sm" responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><Badge bg={u.role === 'admin' ? 'danger' : 'primary'}>{u.role}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
