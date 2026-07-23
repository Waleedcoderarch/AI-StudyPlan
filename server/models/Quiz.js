const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  quizTitle: { type: String, required: true },
  topic: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
  timeTaken: { type: Number, default: 0 }, // in seconds
  completedAt: { type: Date, default: Date.now }
});

const quizSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  questions: [{
    id: Number,
    question: String,
    options: {
      A: String,
      B: String,
      C: String,
      D: String
    },
    correctAnswer: String,
    explanation: String
  }],
  results: [quizResultSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
