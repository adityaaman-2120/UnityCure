import mongoose from 'mongoose';

const sosReportSchema = new mongoose.Schema({
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
  symptoms: [{
    type: String,
    required: true
  }],
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
sosReportSchema.index({ location: '2dsphere' });
sosReportSchema.index({ createdAt: -1 });

export default mongoose.model('SosReport', sosReportSchema);