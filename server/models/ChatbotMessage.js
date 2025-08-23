import mongoose from 'mongoose';

const chatbotMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },
  userMessage: {
    type: String,
    required: true
  },
  botResponse: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
chatbotMessageSchema.index({ userId: 1, createdAt: -1 });
chatbotMessageSchema.index({ sessionId: 1, createdAt: -1 });

export default mongoose.model('ChatbotMessage', chatbotMessageSchema);