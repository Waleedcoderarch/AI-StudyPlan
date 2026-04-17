const express = require('express');
const router = express.Router();
const { createQuiz, saveQuizResult, getQuizHistory } = require('../controllers/quizController');

router.post('/', createQuiz);
router.post('/result', saveQuizResult);
router.get('/history/:sessionId', getQuizHistory);

module.exports = router;
