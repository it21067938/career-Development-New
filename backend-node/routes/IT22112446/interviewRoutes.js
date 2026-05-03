const express = require('express');
const router = express.Router();
const interviewController = require('../../controller/IT22112446/interviewController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze-audio', upload.single('audio'), interviewController.analyzeAudio);
router.post('/analyze-cv', upload.single('file'), interviewController.analyzeCV);
router.post('/generate-questions', interviewController.generateQuestions);
router.post('/analyze-answer', interviewController.analyzeAnswer);

module.exports = router;