const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');

// Get all history for a session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const [conversation, notes, quizzes] = await Promise.all([
      Conversation.findOne({ where: { sessionId } }),
      Note.findAll({
        where: { sessionId },
        attributes: ['fileName', 'pages', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      }),
      Quiz.findAll({
        where: { sessionId },
        attributes: ['title', 'topic', 'results', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      })
    ]);

    res.json({
      success: true,
      conversations: conversation ? conversation.messages || [] : [],
      notes,
      quizzes
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

module.exports = router;
