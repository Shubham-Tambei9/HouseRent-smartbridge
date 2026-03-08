import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { FiHome, FiSearch, FiList, FiCalendar, FiGrid, FiShield, FiLogOut, FiLogIn, FiUserPlus } from 'react-icons/fi';
import { BsHouseHeartFill } from 'react-icons/bs';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/api/bookings/my/upcoming-count')
        .then(res => setUpcomingCount(res.data.count))
        .catch(console.error);
    } else {
      setUpcomingCount(0);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <BSNavbar
      variant="dark"
      expand="lg"
      className={`navbar-premium ${scrolled ? 'navbar-scrolled' : ''}`}
      style={{ position: 'sticky', top: 0, zIndex: 1050 }}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="navbar-brand-premium">
          <BsHouseHeartFill size={26} color="#6366f1" />
          House Rent
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" className="border-0 shadow-none" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto ms-lg-4">
            <Nav.Link as={Link} to="/" className={`nav-link-modern ${isActive('/') ? 'navHoverActive' : ''}`}>
              <FiHome size={18} className="nav-link-icon" /> Home
            </Nav.Link>
            <Nav.Link as={Link} to="/properties" className={`nav-link-modern ${isActive('/properties') ? 'navHoverActive' : ''}`}>
              <FiSearch size={18} className="nav-link-icon" /> Browse Properties
            </Nav.Link>
            {user && (
              <>
                <Nav.Link as={Link} to="/my-listings" className={`nav-link-modern position-relative ${isActive('/my-listings') ? 'navHoverActive' : ''}`}>
                  <FiList size={18} className="nav-link-icon" /> My Listings
                </Nav.Link>
                <Nav.Link as={Link} to="/my-bookings" className={`nav-link-modern position-relative ${isActive('/my-bookings') ? 'navHoverActive' : ''}`}>
                  <FiCalendar size={18} className="nav-link-icon" /> My Bookings
                  {upcomingCount > 0 && (
                    <Badge pill bg="primary" className="ms-2 nav-badge-premium" style={{ fontSize: '0.7rem', transform: 'translateY(-2px)' }}>
                      {upcomingCount} Upcoming
                    </Badge>
                  )}
                </Nav.Link>
                <Nav.Link as={Link} to="/dashboard" className={`nav-link-modern ${isActive('/dashboard') ? 'navHoverActive' : ''}`}>
                  <FiGrid size={18} className="nav-link-icon" /> Dashboard
                </Nav.Link>
                {user.role === 'admin' && (
                  <Nav.Link as={Link} to="/admin" className={`nav-link-modern ${isActive('/admin') ? 'navHoverActive' : ''}`}>
                    <FiShield size={18} className="nav-link-icon" /> Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <Nav className="nav-action-area align-items-lg-center gap-3">
            {user ? (
              <>
                <div className="user-greeting d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white text-uppercase"
                    style={{ width: '32px', height: '32px', fontWeight: 'bold' }}
                  >
                    {user.name ? user.name.charAt(0) : '?'}
                  </div>
                  <span className="text-white">
                    {user.name ? user.name.split(' ')[0] : 'User'}
                  </span>
                </div>
                <button className="btn-nav-outline" onClick={handleLogout}>
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-nav-outline">
                  <FiLogIn size={16} /> Login
                </Link>
                <Link to="/register" className="btn-nav-primary">
                  <FiUserPlus size={16} /> Register
                </Link>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
