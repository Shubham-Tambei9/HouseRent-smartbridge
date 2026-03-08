const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['apartment', 'house', 'studio', 'villa', 'other'], required: true },
    location: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    area: { type: Number, min: 0 },
    images: [{ type: String }],
    amenities: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

propertySchema.index({ location: 'text', city: 'text', title: 'text' });
propertySchema.index({ type: 1, city: 1, price: 1, status: 1 });

module.exports = mongoose.model('Property', propertySchema);
