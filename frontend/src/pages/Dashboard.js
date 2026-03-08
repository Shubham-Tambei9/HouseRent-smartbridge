import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Table, Badge, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b'];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monthly'); // weekly, monthly, yearly

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/dashboard?filter=${filter}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Container className="py-5 text-center min-vh-50 d-flex flex-column justify-content-center">
        <Spinner animation="border" variant="primary" className="mb-3 mx-auto" />
        <p className="text-muted">Loading your dashboard...</p>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container className="py-5 text-center">
        <h3 className="text-danger">Failed to load dashboard</h3>
        <Button onClick={fetchDashboardData} className="mt-3">Retry</Button>
      </Container>
    );
  }

  const { summary, charts, performance } = data;

  return (
    <div className="page-transition-enter-active">
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-5 fade-in-up">
          <div>
            <h1 className="display-5 fw-bold text-white mb-2">Owner Dashboard</h1>
            <p className="text-muted fs-5 mb-0">Welcome back, {user?.name}. Here's what's happening.</p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Form.Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark text-white border-secondary rounded-pill px-4 py-2 shadow-sm view-dropdown"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </Form.Select>
          </div>
        </div>

        {/* --- Top Summary Cards --- */}
        <Row className="g-4 mb-5 fade-in-up-delayed">
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-primary border-3">
              <span className="fs-3 mb-2 d-block">🏡</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Properties</p>
              <h3 className="fw-bold text-white mb-0">{summary.totalProperties}</h3>
            </div>
          </Col>
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-success border-3">
              <span className="fs-3 mb-2 d-block">📅</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Active Bookings</p>
              <h3 className="fw-bold text-white mb-0">{summary.activeBookings}</h3>
            </div>
          </Col>
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-info border-3">
              <span className="fs-3 mb-2 d-block">💰</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Total Earned</p>
              <h3 className="fw-bold text-white mb-0">₹{summary.totalEarnings.toLocaleString('en-IN')}</h3>
            </div>
          </Col>
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-warning border-3">
              <span className="fs-3 mb-2 d-block">📈</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Period Earned</p>
              <h3 className="fw-bold text-white mb-0">₹{summary.periodicEarnings.toLocaleString('en-IN')}</h3>
            </div>
          </Col>
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-danger border-3">
              <span className="fs-3 mb-2 d-block">🧾</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Pending</p>
              <h3 className="fw-bold text-white mb-0">₹{summary.pendingPayments.toLocaleString('en-IN')}</h3>
            </div>
          </Col>
          <Col md={4} lg={2}>
            <div className="glass-panel p-3 h-100 text-center card-hover border-top border-secondary border-3">
              <span className="fs-3 mb-2 d-block">⭐</span>
              <p className="text-muted small text-uppercase tracking-wider fw-bold mb-1">Avg Rating</p>
              <h3 className="fw-bold text-white mb-0">{summary.avgRating}/5</h3>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          {/* --- Revenue Analytics (Charts) --- */}
          <Col lg={8}>
            <div className="glass-panel p-4 h-100 border-0 fade-in-up">
              <h4 className="fw-bold text-white mb-4">Earnings Trend <span className="text-muted fs-6 fw-normal ms-2">({filter})</span></h4>
              <div style={{ height: '300px', width: '100%' }}>
                {charts.earningsTrend?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.earningsTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} name="Earnings (₹)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-100 d-flex justify-content-center align-items-center text-muted">No data for this period.</div>
                )}
              </div>
            </div>
          </Col>

          {/* --- Quick Actions --- */}
          <Col lg={4}>
            <div className="glass-panel p-4 h-100 border-0 fade-in-up-delayed">
              <h4 className="fw-bold text-white mb-4">Quick Actions</h4>
              <div className="d-grid gap-3">
                <Button as={Link} to="/properties/add" variant="primary" className="py-3 text-start d-flex justify-content-between align-items-center rounded-3 fs-5 btn-hover-effect border-0">
                  <span><span className="me-3">➕</span> Add New Property</span>
                  <span className="opacity-50">&rarr;</span>
                </Button>
                <Button as={Link} to="/my-listings" variant="outline-light" className="py-3 text-start d-flex justify-content-between align-items-center rounded-3 fs-5 btn-hover-effect">
                  <span><span className="me-3">✏️</span> Edit Listings</span>
                  <span className="opacity-50">&rarr;</span>
                </Button>
                <Button as={Link} to="/manage-bookings" variant="outline-light" className="py-3 text-start d-flex justify-content-between align-items-center rounded-3 fs-5 btn-hover-effect">
                  <span><span className="me-3">📑</span> View Requests</span>
                  <span className="opacity-50">&rarr;</span>
                </Button>
                <Button variant="outline-secondary" className="py-3 text-start d-flex justify-content-between align-items-center rounded-3 fs-5" disabled>
                  <span><span className="me-3">💬</span> Messages (Soon)</span>
                  <span className="opacity-50">&rarr;</span>
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col lg={4}>
            {/* --- Payment Status (Pie Chart) --- */}
            <div className="glass-panel p-4 h-100 border-0 fade-in-up">
              <h4 className="fw-bold text-white mb-4">Payment Status</h4>
              <div style={{ height: '250px', width: '100%' }} className="position-relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={charts.paymentStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      {charts.paymentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>

          <Col lg={4}>
            {/* --- Bookings Overview (Bar Chart) --- */}
            <div className="glass-panel p-4 h-100 border-0 fade-in-up-delayed">
              <h4 className="fw-bold text-white mb-4">Bookings Overview</h4>
              <div style={{ height: '250px', width: '100%' }}>
                {charts.bookingsOverview?.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.bookingsOverview} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }} />
                      <Bar dataKey="bookings" fill="#10b981" radius={[4, 4, 0, 0]} name="Bookings" maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-100 d-flex justify-content-center align-items-center text-muted">No bookings.</div>
                )}
              </div>
            </div>
          </Col>

          {/* --- Notifications & Alerts --- */}
          <Col lg={4}>
            <div className="glass-panel p-4 h-100 border-0 fade-in-up-delayed" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-white mb-0">Alerts</h4>
                <Badge bg="danger" pill>3 New</Badge>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444' }}>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">⏰</span> <strong className="text-white">Upcoming check-in</strong>
                  </div>
                  <p className="text-muted small mb-0">Guest "Alice" arriving tomorrow at {performance.mostBooked?.title || 'Property'}.</p>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(245, 158, 11, 0.1)', borderLeft: '4px solid #f59e0b' }}>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">💳</span> <strong className="text-white">Pending Payment</strong>
                  </div>
                  <p className="text-muted small mb-0">Booking #89A requires manual approval for payment.</p>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(16, 185, 129, 0.1)', borderLeft: '4px solid #10b981' }}>
                  <div className="d-flex align-items-center mb-1">
                    <span className="me-2">🔔</span> <strong className="text-white">New Inquiry</strong>
                  </div>
                  <p className="text-muted small mb-0">Someone asked about pet policy for {performance.mostViewed?.title || 'your property'}.</p>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* --- Property Performance List --- */}
        <div className="glass-panel p-0 border-0 overflow-hidden fade-in-up">
          <div className="p-4 border-bottom border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
            <h4 className="fw-bold text-white mb-0">Property Performance</h4>
          </div>
          <div className="table-responsive">
            <Table variant="dark" hover className="mb-0 bg-transparent align-middle border-secondary" style={{ borderColor: 'var(--border-color) !important' }}>
              <thead>
                <tr>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 ps-4 border-bottom-0">Property</th>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 border-bottom-0">Bookings</th>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 border-bottom-0">Revenue</th>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 border-bottom-0">Views (30d)</th>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 border-bottom-0">Occupancy</th>
                  <th className="bg-transparent text-muted fw-bold text-uppercase tracking-wider small py-3 pe-4 border-bottom-0 text-center">🏆 Rank</th>
                </tr>
              </thead>
              <tbody>
                {performance.all.length > 0 ? (
                  performance.all.map((p, index) => (
                    <tr key={index}>
                      <td className="bg-transparent text-white fw-semibold ps-4 py-3 border-secondary truncate-text" style={{ maxWidth: '200px' }}>
                        {p.title}
                      </td>
                      <td className="bg-transparent text-light border-secondary">{p.bookings}</td>
                      <td className="bg-transparent text-success fw-bold border-secondary">₹{p.earnings.toLocaleString('en-IN')}</td>
                      <td className="bg-transparent text-light border-secondary">
                        <span className="me-2">👁️</span>{p.views}
                      </td>
                      <td className="bg-transparent border-secondary">
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-light">{p.occupancyRate}%</span>
                          <div className="progress w-100 bg-dark" style={{ height: '6px' }}>
                            <div className="progress-bar bg-primary" style={{ width: `${p.occupancyRate}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="bg-transparent text-center border-secondary pe-4">
                        {index === 0 && <Badge bg="warning" text="dark" className="rounded-pill">Top</Badge>}
                        {index !== 0 && index === performance.all.length - 1 && <Badge bg="danger" className="rounded-pill">Needs Push</Badge>}
                        {index !== 0 && index !== performance.all.length - 1 && <span className="text-muted">#{index + 1}</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-5 bg-transparent border-0">
                      No property performance data yet. Starting listing properties!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

      </Container>
    </div>
  );
}
