import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  doctorName: {
    type: String,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  patient: {
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      min: 0,
      max: 150
    },
    contact: {
      type: String
    },
    reason: {
      type: String
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ date: 1, doctorName: 1 });
appointmentSchema.index({ hospital: 1 });

export default mongoose.model('Appointment', appointmentSchema);