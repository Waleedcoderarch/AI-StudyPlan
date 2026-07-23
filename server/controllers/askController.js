const { answerQuestion } = require('../services/openaiService');
const Conversation = require('../models/Conversation');

const askQuestion = async (req, res) => {
  try {
    const { question, sessionId, history = [] } = req.body;

    if (!question || question.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Question cannot be empty'
      });
    }

    if (question.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Question is too long. Please keep it under 2000 characters.'
      });
    }

    // Get AI answer
    const answer = await answerQuestion(question.trim(), history);

    // Save to MongoDB if available
    if (sessionId && process.env.MONGO_URI) {
      try {
        let conversation = await Conversation.findOne({ sessionId });
        if (!conversation) {
          conversation = new Conversation({ sessionId, messages: [] });
        }
        conversation.messages.push({ question: question.trim(), answer });
        await conversation.save();
      } catch (dbError) {
        console.warn('DB save failed (non-critical):', dbError.message);
      }
    }

    res.json({
      success: true,
      answer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Ask controller error:', error);

    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        success: false,
        message: 'OpenAI API quota exceeded. Please check your billing.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        success: false,
        message: 'Invalid OpenAI API key. Please check your configuration.'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get answer. Please try again.'
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!process.env.MONGO_URI) {
      return res.json({ success: true, messages: [] });
    }

    const conversation = await Conversation.findOne({ sessionId });
    res.json({
      success: true,
      messages: conversation ? conversation.messages : []
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history'
    });
  }
};

module.exports = { askQuestion, getHistory };
