const Property = require('../models/Property');
const { validationResult } = require('express-validator');

exports.getAll = async (req, res, next) => {
  try {
    const { search, type, city, minPrice, maxPrice, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    else filter.status = 'approved';
    if (type) filter.type = type;
    if (city) filter.city = new RegExp(city, 'i');
    if (minPrice != null || maxPrice != null) {
      filter.price = {};
      if (minPrice != null && minPrice !== '') filter.price.$gte = Number(minPrice);
      if (maxPrice != null && maxPrice !== '') filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }
    const properties = await Property.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone').lean();
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json(property);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = { ...req.body, owner: req.user._id, status: 'approved' };
    const property = await Property.create(data);
    const populated = await Property.findById(property._id).populate('owner', 'name email').lean();
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to update this property' });
    }
    const allowed = ['title', 'description', 'type', 'location', 'city', 'price', 'bedrooms', 'bathrooms', 'area', 'images', 'amenities'];
    allowed.forEach((k) => {
      if (req.body[k] !== undefined) property[k] = req.body[k];
    });
    if (req.user.role !== 'admin') property.status = 'approved';
    await property.save();
    const populated = await Property.findById(property._id).populate('owner', 'name email').lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'admin' && property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this property' });
    }
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    next(err);
  }
};

exports.approve = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    property.status = status;
    property.approvedBy = req.user._id;
    property.approvedAt = new Date();
    await property.save();
    const populated = await Property.findById(property._id).populate('owner', 'name email').lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.myListings = async (req, res, next) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(properties);
  } catch (err) {
    next(err);
  }
};

exports.pendingForAdmin = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(properties);
  } catch (err) {
    next(err);
  }
};
