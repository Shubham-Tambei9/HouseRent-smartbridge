import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner } from 'react-bootstrap';
import api from '../api/axios';
import PropertyCard from '../components/PropertyCard';

const PROPERTY_TYPES = ["Apartment", "House", "Studio", "Villa", "Condo"];

export default function Home() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [loadingProps, setLoadingProps] = useState(true);

  // Typing effect state
  const [currentTypeIndex, setCurrentTypeIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    api.get('/api/properties')
      .then(res => {
        // Take latest 3 for the bottom section
        setFeaturedProperties(res.data.slice(0, 3));

        // Extract up to 8 images from recent properties for the rotating hero carousel
        const extractedImages = [];
        for (let p of res.data) {
          if (p.images && p.images.length > 0) {
            extractedImages.push(p.images[0].startsWith('http') ? p.images[0] : `http://localhost:5000${p.images[0]}`);
          } else if (p.image) {
            extractedImages.push(p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`);
          }
          if (extractedImages.length >= 8) break;
        }

        // Final fallback just in case there are no DB images yet
        if (extractedImages.length === 0) {
          extractedImages.push('/hero-image.png');
        }

        setHeroImages(extractedImages);
      })
      .catch(console.error)
      .finally(() => setLoadingProps(false));
  }, []);

  // Handle Carousel Rotation every 5s
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Handle Typing Effect
  useEffect(() => {
    const currentWord = PROPERTY_TYPES[currentTypeIndex];
    let typeSpeed = isDeleting ? 40 : 120; // Type faster when deleting

    let timeout;

    if (!isDeleting && currentText === currentWord) {
      // Pause at the end of the word
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === '') {
      // Move to next word when deleted
      setIsDeleting(false);
      setCurrentTypeIndex((prev) => (prev + 1) % PROPERTY_TYPES.length);
    } else {
      // Add or remove character
      timeout = setTimeout(() => {
        setCurrentText(currentWord.substring(0, currentText.length + (isDeleting ? -1 : 1)));
      }, typeSpeed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentTypeIndex]);

  return (
    <div className="page-transition-enter-active">
      <div className="py-5 mb-5 position-relative overflow-hidden">
        <Container className="position-relative" style={{ zIndex: 1 }}>
          <Row className="align-items-center fade-in-up min-vh-50 py-5">
            <Col md={7} className="mb-5 mb-md-0">
              <h1 className="display-4 fw-bolder mb-4" style={{ background: 'linear-gradient(to right, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', minHeight: '120px' }}>
                Find Your Perfect Rental <br />
                <span
                  className="typing-cursor"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    paddingRight: '6px'
                  }}
                >
                  {currentText || '\u200B'}
                </span>
              </h1>
              <p className="lead text-light mb-5 fs-4" style={{ maxWidth: '600px', opacity: 0.9 }}>
                Browse verified properties, filter by location and price, and book with absolute confidence.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Button as={Link} to="/properties" className="btn-primary px-5 py-3 fs-5 rounded-pill">
                  Browse Properties
                </Button>
                <Button as={Link} to="/register" className="btn-secondary px-5 py-3 fs-5 rounded-pill">
                  Get Started
                </Button>
              </div>
            </Col>
            <Col md={5} className="d-none d-md-block premium-card-wrapper position-relative fade-in-up-delayed">
              {/* Decorative background glow behind the image */}
              <div className="position-absolute top-50 start-50 translate-middle w-100 h-100" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }}></div>

              <div className="position-relative w-100 floating-element" style={{ paddingBottom: '75%', borderRadius: '24px', overflow: 'hidden', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5)) drop-shadow(0 0 40px rgba(139,92,246,0.3))' }}>
                {heroImages.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Hero Gallery ${idx + 1}`}
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                    style={{
                      opacity: idx === currentHeroIndex ? 1 : 0,
                      transition: 'opacity 1s ease-in-out',
                      transform: idx === currentHeroIndex ? 'scale(1)' : 'scale(1.05)',
                    }}
                  />
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Properties Section */}
      <Container className="mb-5 pb-5">
        <div className="d-flex justify-content-between align-items-end mb-4 fade-in-up">
          <div>
            <h2 className="display-6 fw-bold mb-2">Latest Listings</h2>
            <p className="text-muted mb-0 fs-5">Handpicked properties available for you today.</p>
          </div>
          <Button as={Link} to="/properties" variant="outline-primary" className="rounded-pill px-4 d-none d-md-block">
            View All &rarr;
          </Button>
        </div>

        {loadingProps ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : featuredProperties.length === 0 ? (
          <p className="text-muted text-center py-5">No properties available at the moment.</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4 fade-in-up-delayed">
            {featuredProperties.map(p => (
              <Col key={p._id}>
                <PropertyCard property={p} />
              </Col>
            ))}
          </Row>
        )}
        <div className="text-center mt-4 d-md-none">
          <Button as={Link} to="/properties" variant="outline-primary" className="rounded-pill px-4 w-100">
            View All Properties
          </Button>
        </div>
      </Container>

      <Container className="mb-5 pb-5">
        <div className="text-center mb-5 fade-in-up">
          <h2 className="display-6 fw-bold mb-3">How It Works</h2>
          <div className="mx-auto rounded-pill mb-4" style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
        </div>

        <Row className="fade-in-up-delayed g-4">
          <Col md={4}>
            <div className="glass-panel h-100 p-4 text-center card-hover border-0">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', background: 'var(--primary-soft)' }}>
                <span className="fs-1">🔍</span>
              </div>
              <h4 className="fw-bold mb-3 text-white">Search</h4>
              <p className="text-muted mb-0">Filter by location, price, and property type to find the right fit for your lifestyle.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="glass-panel h-100 p-4 text-center card-hover border-0">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', background: 'rgba(236,72,153,0.15)' }}>
                <span className="fs-1">📋</span>
              </div>
              <h4 className="fw-bold mb-3 text-white">List or Book</h4>
              <p className="text-muted mb-0">Owners list properties easily; renters book and manage their stays seamlessly.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="glass-panel h-100 p-4 text-center card-hover border-0">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4" style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)' }}>
                <span className="fs-1">✨</span>
              </div>
              <h4 className="fw-bold mb-3 text-white">Verified</h4>
              <p className="text-muted mb-0">All listings are carefully moderated to ensure your safety and absolute peace of mind.</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Animated Metrics Section */}
      <Container className="mb-5 pb-5 position-relative">
        <div className="text-center mb-5 fade-in-up">
          <h2 className="display-6 fw-bold mb-3">Our Impact</h2>
          <div className="mx-auto rounded-pill mb-4" style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}></div>
        </div>
        <Row className="g-4 text-center">
          {[
            { delay: '0.1s', icon: '🌍', value: '10,000+', label: 'Happy Customers' },
            { delay: '0.2s', icon: '🏡', value: '5,000+', label: 'Properties Listed' },
            { delay: '0.3s', icon: '🏙️', value: '150+', label: 'Cities Covered' },
            { delay: '0.4s', icon: '⭐', value: '4.9/5', label: 'Average Rating' },
          ].map((stat, i) => (
            <Col md={3} sm={6} key={i}>
              <div
                className="glass-panel p-4 h-100 card-hover fade-in-up"
                style={{ animationDelay: stat.delay, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="display-5 mb-2" style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}>{stat.icon}</div>
                <h3 className="fw-bold text-white mb-1">{stat.value}</h3>
                <p className="text-muted small mb-0 text-uppercase fw-semibold tracking-wider">{stat.label}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
