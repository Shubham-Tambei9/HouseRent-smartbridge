const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { validationResult } = require('express-validator');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { propertyId, checkIn, checkOut, guests, message } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'approved') return res.status(400).json({ message: 'Property is not available for booking' });
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book your own property' });
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }
    const nights = Math.max(1, Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)));
    const totalAmount = nights * property.price;
    const booking = await Booking.create({
      property: propertyId,
      user: req.user._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || 1,
      totalAmount,
      message,
    });
    const populated = await Booking.findById(booking._id)
      .populate('property', 'title location city price')
      .populate('user', 'name email')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('property', 'title location city price images')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getPropertyBookings = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const bookings = await Booking.find({ property: req.params.propertyId })
      .populate('user', 'name email')
      .sort({ checkIn: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Ensure only the user who made the booking can cancel it
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel a booking that is already completed or cancelled' });
    }

    // Check if check-in time hasn't passed
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);

    // Remove the time from both dates to compare just the calendar day properly, or just use raw dates.
    // The requirement says "before arrival or checkin".
    if (now >= checkInDate) {
      return res.status(400).json({ message: 'Cannot cancel a booking after the check-in date' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Return updated booking
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner = booking.property.owner.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isOwner && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    booking.status = status;
    await booking.save();
    const populated = await Booking.findById(booking._id)
      .populate('property', 'title location city price')
      .populate('user', 'name email')
      .lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('property', 'title location city')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getIncomingPendingCount = async (req, res, next) => {
  try {
    const ownerProperties = await Property.find({ owner: req.user._id }).select('_id');
    const propertyIds = ownerProperties.map((p) => p._id);
    const count = await Booking.countDocuments({ property: { $in: propertyIds }, status: 'pending' });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

exports.getReservedDates = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Auto-complete past bookings before returning reserved dates
    await Booking.updateMany(
      {
        property: req.params.propertyId,
        status: { $in: ['confirmed', 'pending'] },
        checkOut: { $lt: today }
      },
      {
        $set: { status: 'completed' }
      }
    );

    // Only fetch bookings that are NOT cancelled
    // and ONLY fetch bookings where checkOut has not passed today
    const bookings = await Booking.find({
      property: req.params.propertyId,
      status: { $ne: 'cancelled' },
      checkOut: { $gte: today }
    })
      .select('checkIn checkOut -_id')
      .lean();

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getUpcomingMyBookingsCount = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await Booking.countDocuments({
      user: req.user._id,
      status: { $in: ['pending', 'confirmed'] },
      checkIn: { $gte: today }
    });

    res.json({ count });
  } catch (err) {
    next(err);
  }
};
