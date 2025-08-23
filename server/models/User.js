import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Citizen', 'Hospital Staff', 'Doctor', 'Dispatcher', 'Platform Admin']
  },
  redirect: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create index for case-insensitive identifier search
userSchema.index({ identifier: 1 }, { collation: { locale: 'en', strength: 2 } });

export default mongoose.model('User', userSchema);