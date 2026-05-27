const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const assetSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      unique: true,
      default: () => `AC-${nanoid(8).toUpperCase()}`,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['machinery', 'vehicle', 'tool', 'it-equipment', 'furniture', 'other'],
      default: 'other',
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance', 'in-transit', 'lost', 'retired'],
      default: 'active',
    },
    location: {
      address: { type: String, default: 'Unknown' },
      lat: { type: Number },
      lng: { type: Number },
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    qrCode: {
      type: String, // base64 PNG data URL
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    nextMaintenanceDate: {
      type: Date,
    },
    aiFailureRisk: {
      type: Number,
      default: null,
      min: 0,
      max: 1
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Soft delete filter
assetSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model('Asset', assetSchema);
