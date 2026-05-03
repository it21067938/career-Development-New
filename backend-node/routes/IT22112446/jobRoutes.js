const express = require('express');
const router = express.Router();
const multer = require('multer');
const jobController = require('../../controller/IT22112446/jobController');

// File - transient storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), jobController.processJobMatch);

module.exports = router;