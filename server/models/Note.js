const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  originalText: { type: String, required: true },
  generatedNotes: { type: String, required: true },
  pages: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
