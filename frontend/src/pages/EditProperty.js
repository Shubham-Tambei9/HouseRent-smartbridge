import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../api/axios';
import AlertMessage from '../components/AlertMessage';

const TYPES = ['apartment', 'house', 'studio', 'villa', 'other'];

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    location: '',
    city: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: '',
  });

  useEffect(() => {
    api.get('/api/properties/' + id).then((res) => {
      const p = res.data;
      setProperty(p);
      setUploadedImageUrls(p.images || []);
      setForm({
        title: p.title || '',
        description: p.description || '',
        type: p.type || 'apartment',
        location: p.location || '',
        city: p.city || '',
        price: p.price ?? '',
        bedrooms: p.bedrooms ?? '',
        bathrooms: p.bathrooms ?? '',
        area: p.area ?? '',
        amenities: Array.isArray(p.amenities) ? p.amenities.join(', ') : '',
      });
    }).catch(() => setProperty(null));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setUploadingImage(true);
    setError('');

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const { data } = await api.post('/api/properties/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedImageUrls(prev => [...prev, ...data.urls]);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Failed to upload images. Please ensure they are smaller than 5MB and are valid image types (JPG, PNG, WEBP).');
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const removeImage = (indexToRemove) => {
    setUploadedImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (uploadedImageUrls.length === 0) {
      setError('Please upload at least one image of the property.');
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      type: form.type,
      location: form.location,
      city: form.city,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      area: form.area ? Number(form.area) : undefined,
      amenities: form.amenities ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
      images: uploadedImageUrls,
    };
    try {
      await api.put('/api/properties/' + id, payload);
      navigate('/my-listings');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!property) {
    return (
      <Container className="py-5 text-center min-vh-50 d-flex flex-column justify-content-center">
        <Spinner animation="border" variant="primary" className="mx-auto mb-3" />
        <p className="text-muted">Loading property details...</p>
      </Container>
    );
  }

  return (
    <div className="page-transition-enter-active">
      <Container className="py-5 max-w-4xl mx-auto">
        <div className="text-center mb-5 fade-in-up">
          <h1 className="display-4 fw-bold text-white mb-2">Edit Property</h1>
          <p className="text-muted fs-5">Update details and manage photos for "{property.title}"</p>
        </div>

        <Card className="glass-panel border-0 fade-in-up-delayed p-md-4">
          <Card.Body>
            <AlertMessage variant="danger" message={error} onClose={() => setError('')} />

            <Form onSubmit={handleSubmit}>
              <Row className="g-4 mb-4">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Property Title</Form.Label>
                    <Form.Control name="title" value={form.title} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Description</Form.Label>
                    <Form.Control as="textarea" rows={5} name="description" value={form.description} onChange={handleChange} required />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Property Type</Form.Label>
                    <Form.Select name="type" value={form.type} onChange={handleChange} className="py-3 cursor-pointer">
                      {TYPES.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">City</Form.Label>
                    <Form.Control name="city" value={form.city} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Full Address</Form.Label>
                    <Form.Control name="location" value={form.location} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={3} xs={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Per Day Price (₹)</Form.Label>
                    <Form.Control type="number" min="0" name="price" value={form.price} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={3} xs={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Bedrooms</Form.Label>
                    <Form.Control type="number" min="0" name="bedrooms" value={form.bedrooms} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={3} xs={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Bathrooms</Form.Label>
                    <Form.Control type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={handleChange} required className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={3} xs={6}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Area (sq ft)</Form.Label>
                    <Form.Control type="number" min="0" name="area" value={form.area} onChange={handleChange} className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="text-light fw-semibold">Amenities (comma-separated)</Form.Label>
                    <Form.Control name="amenities" value={form.amenities} onChange={handleChange} className="py-3" />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Label className="text-light fw-semibold mb-3">Property Photos</Form.Label>

                  {/* Dropzone Area */}
                  <div
                    {...getRootProps()}
                    className={`p-5 text-center rounded-4 cursor-pointer mb-4 ${isDragActive ? 'bg-primary bg-opacity-10 border-primary' : ''}`}
                    style={{
                      border: '2px dashed var(--glass-border)',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'rgba(30, 41, 59, 0.4)'
                    }}
                  >
                    <input {...getInputProps()} />

                    {uploadingImage ? (
                      <div className="py-4">
                        <Spinner animation="grow" variant="primary" className="mb-3" />
                        <h5 className="text-white">Uploading Photos...</h5>
                      </div>
                    ) : (
                      <div className="py-3">
                        <div className="text-primary mb-3">
                          <FiUploadCloud size={48} />
                        </div>
                        <h5 className="text-white mb-2">
                          {isDragActive ? "Drop the images here!" : "Drag & drop photos here"}
                        </h5>
                        <p className="text-muted mb-0">or click to browse your files (JPG, PNG, WEBP)</p>
                      </div>
                    )}
                  </div>

                  {/* Image Previews */}
                  {uploadedImageUrls.length > 0 && (
                    <div className="mb-4 p-4 rounded-4" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <h6 className="text-muted mb-3 text-uppercase tracking-wider small">Uploaded Photos ({uploadedImageUrls.length})</h6>
                      <div className="d-flex gap-3 flex-wrap">
                        {uploadedImageUrls.map((url, idx) => (
                          <div key={idx} className="position-relative hover-overlay" style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img
                              src={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                              alt={`Preview ${idx}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center opacity-0 hover-opacity-100 transition-fast">
                              <Button
                                variant="danger"
                                size="sm"
                                className="rounded-circle p-2 d-flex justify-content-center align-items-center"
                                onClick={() => removeImage(idx)}
                              >
                                <FiX size={16} />
                              </Button>
                            </div>
                            {idx === 0 && <Badge bg="primary" className="position-absolute top-0 start-0 m-2">Cover</Badge>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Col>
              </Row>

              <hr className="my-4 border-secondary opacity-25" />

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button as={Link} to={`/properties/${id}`} variant="outline-light" className="px-4 py-3 fw-semibold rounded-pill">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="px-5 py-3 fw-semibold rounded-pill"
                  disabled={loading || uploadingImage || uploadedImageUrls.length === 0}
                >
                  {loading ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Saving...</>
                  ) : 'Save Changes'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
