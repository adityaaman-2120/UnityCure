import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  emergencyServices: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ name: 'text', specialty: 'text' });
hospitalSchema.index({ emergencyServices: 1 });

export default mongoose.model('Hospital', hospitalSchema);