const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');

// Get all history for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!process.env.MONGO_URI) {
      return res.json({ success: true, conversations: [], notes: [], quizzes: [] });
    }

    const [conversation, notes, quizzes] = await Promise.all([
      Conversation.findOne({ sessionId }).select('messages').lean(),
      Note.find({ sessionId }).select('fileName pages createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Quiz.find({ sessionId }).select('title topic results createdAt').sort({ createdAt: -1 }).limit(5).lean()
    ]);

    res.json({
      success: true,
      conversations: conversation?.messages || [],
      notes,
      quizzes
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

module.exports = router;
