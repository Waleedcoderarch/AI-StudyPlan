const { generateNotes } = require('../services/openaiService');
const Note = require('../models/Note');

const createNotes = async (req, res) => {
  try {
    const { text, fileName, sessionId, pages, fileSize } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No text provided to generate notes from.'
      });
    }

    if (text.trim().length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Text is too short to generate meaningful notes. Please upload a more substantial document.'
      });
    }

    // Generate notes using AI
    const notes = await generateNotes(text.trim(), fileName || 'Document');

    // Save to DB (SQLite via Sequelize)
    if (sessionId) {
      try {
        await Note.create({
          sessionId,
          fileName: fileName || 'Unknown',
          originalText: text.trim().substring(0, 5000),
          generatedNotes: notes,
          pages: pages || 0,
          fileSize: fileSize || 0
        });
      } catch (dbError) {
        console.warn('DB save failed (non-critical):', dbError.message);
      }
    }

    res.json({
      success: true,
      notes,
      fileName: fileName || 'Document',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Notes controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate notes. Please try again.'
    });
  }
};

const getNoteHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const notes = await Note.findAll({
      where: { sessionId },
      attributes: ['fileName', 'pages', 'fileSize', 'createdAt', 'generatedNotes'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json({ success: true, notes });
  } catch (error) {
    console.error('Get notes history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes history' });
  }
};

module.exports = { createNotes, getNoteHistory };
