const express = require('express');
const { body, param } = require('express-validator');
const {
  create: createBooking,
  getMyBookings,
  getPropertyBookings,
  updateStatus,
  getAllBookingsAdmin,
  getIncomingPendingCount,
  getReservedDates,
  cancelBooking,
  getUpcomingMyBookingsCount,
} = require('../controllers/bookingController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  [
    body('propertyId').isMongoId().withMessage('Valid property ID required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date required'),
    body('guests').optional().isInt({ min: 1 }),
    body('message').optional().isString(),
  ],
  createBooking
);

// Public route to get reserved dates for calendar blocking
router.get('/property/:propertyId/reserved-dates', param('propertyId').isMongoId(), getReservedDates);

router.get('/my', auth, getMyBookings);
router.get('/my/upcoming-count', auth, getUpcomingMyBookingsCount);
router.get('/incoming/pending-count', auth, getIncomingPendingCount);
router.get('/admin', auth, adminOnly, getAllBookingsAdmin);
router.get('/property/:propertyId', auth, param('propertyId').isMongoId(), getPropertyBookings);
router.patch('/:id/cancel', auth, param('id').isMongoId(), cancelBooking);
router.patch(
  '/:id/status',
  auth,
  param('id').isMongoId(),
  body('status').isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  updateStatus
);

module.exports = router;
