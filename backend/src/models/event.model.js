const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    assetCode: {
      type: String, // The human-readable AC-XXXXXXXX code
      required: true,
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['scan', 'maintenance', 'in-transit', 'found', 'lost', 'active'],
      required: true,
    },
    location: {
      address: { type: String, default: 'Unknown' },
      lat: { type: Number },
      lng: { type: Number },
    },
    notes: {
      type: String,
      trim: true,
    },
    synced: {
      type: Boolean,
      default: false, // True once confirmed received from operator
    },
    clientTimestamp: {
      type: Date, // When it happened on the device
      required: true,
    },
  },
  { timestamps: true } // createdAt = when server received it
);

module.exports = mongoose.model('Event', eventSchema);
