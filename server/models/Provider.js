import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  providerType: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  contact: {
    type: String,
    required: true
  },
  services: [{
    type: String
  }],
  specialty: {
    type: String
  },
  admin: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
providerSchema.index({ location: '2dsphere' });
providerSchema.index({ providerType: 1 });
providerSchema.index({ name: 'text', specialty: 'text' });

export default mongoose.model('Provider', providerSchema);