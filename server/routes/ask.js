const express = require('express');
const router = express.Router();
const { askQuestion, getHistory } = require('../controllers/askController');

router.post('/', askQuestion);
router.get('/history/:sessionId', getHistory);

module.exports = router;
