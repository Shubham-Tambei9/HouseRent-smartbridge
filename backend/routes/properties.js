const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getAll,
  getOne,
  create,
  update,
  delete: deleteProperty,
  approve,
  myListings,
  pendingForAdmin,
} = require('../controllers/propertyController');
const { auth, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['apartment', 'house', 'studio', 'villa', 'other']).withMessage('Valid type required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms required'),
  body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms required'),
  body('area').optional().isFloat({ min: 0 }),
  body('images').optional().isArray(),
  body('amenities').optional().isArray(),
];

router.get('/', getAll);
router.get('/my-listings', auth, myListings);
router.get('/pending', auth, adminOnly, pendingForAdmin);

// Image Upload Endpoint (must execute before /:id)
router.post('/upload', auth, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No images uploaded' });
  }
  // Map files to local URL paths
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  res.json({ urls: imageUrls });
});

router.get('/:id', param('id').isMongoId(), getOne);
router.post('/', auth, createValidation, create);
router.put('/:id', auth, param('id').isMongoId(), update);
router.delete('/:id', auth, param('id').isMongoId(), deleteProperty);
router.patch('/:id/approve', auth, adminOnly, param('id').isMongoId(), body('status').isIn(['approved', 'rejected']), approve);

module.exports = router;
