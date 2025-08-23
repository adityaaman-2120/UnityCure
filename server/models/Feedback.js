import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    required: true
  },
  serviceType: {
    type: String,
    required: true
  },
  userId: {
    type: String
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
feedbackSchema.index({ serviceId: 1, serviceType: 1 });
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ rating: 1 });

export default mongoose.model('Feedback', feedbackSchema);