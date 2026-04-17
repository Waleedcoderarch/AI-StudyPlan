const express = require('express');
const router = express.Router();
const { createNotes, getNoteHistory } = require('../controllers/notesController');

router.post('/', createNotes);
router.get('/history/:sessionId', getNoteHistory);

module.exports = router;
