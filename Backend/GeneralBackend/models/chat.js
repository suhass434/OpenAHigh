const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  id: Number,
  text: String,
  sender: {
    type: String,
    enum: ['user', 'bot']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sources: [{
    source: String
  }]
});

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: String,
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Chat', chatSchema); 