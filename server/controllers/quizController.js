const { generateQuiz } = require('../services/openaiService');
const Quiz = require('../models/Quiz');

const createQuiz = async (req, res) => {
  try {
    const { input, inputType = 'topic', questionCount = 7, sessionId } = req.body;

    if (!input || input.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic or text to generate quiz from.'
      });
    }

    const count = Math.min(Math.max(parseInt(questionCount) || 7, 5), 10);

    // Generate quiz using AI
    const quizData = await generateQuiz(input.trim(), count, inputType);

    if (!quizData.questions || quizData.questions.length === 0) {
      throw new Error('No questions were generated. Please try again.');
    }

    // Save to DB (SQLite via Sequelize)
    let quizId = null;
    if (sessionId) {
      try {
        const saved = await Quiz.create({
          sessionId,
          title: quizData.title,
          topic: input.trim().substring(0, 200),
          questions: quizData.questions
        });
        quizId = saved.id;
      } catch (dbError) {
        console.warn('DB save failed (non-critical):', dbError.message);
      }
    }

    res.json({
      success: true,
      quizId,
      title: quizData.title,
      questions: quizData.questions,
      totalQuestions: quizData.questions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Quiz controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate quiz. Please try again.'
    });
  }
};

const saveQuizResult = async (req, res) => {
  try {
    const { quizId, sessionId, score, totalQuestions, timeTaken, quizTitle, topic } = req.body;

    const percentage = Math.round((score / totalQuestions) * 100);

    if (quizId) {
      try {
        const quiz = await Quiz.findByPk(quizId);
        const results = quiz.results || [];
        results.push({ sessionId, quizTitle, topic, totalQuestions, score, percentage, timeTaken: timeTaken || 0, completedAt: new Date() });
        await quiz.update({ results });
      } catch (dbError) {
        console.warn('DB update failed (non-critical):', dbError.message);
      }
    }

    res.json({ success: true, percentage, message: 'Result saved successfully' });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ success: false, message: 'Failed to save quiz result' });
  }
};

const getQuizHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const quizzes = await Quiz.findAll({
      where: { sessionId },
      attributes: ['title', 'topic', 'questions', 'createdAt', 'results'],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quiz history' });
  }
};

module.exports = { createQuiz, saveQuizResult, getQuizHistory };
