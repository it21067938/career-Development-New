const axios = require('axios');
const FormData = require('form-data');

const FLASK_INTERVIEW_URL = process.env.IT22112446_FLASK_RESEARCH_CORE_URL;
const FLASK_JOB_URL = process.env.IT22112446_FLASK_JOB_MATCH_URL;
const GROQ_KEY = process.env.GROQ_API_KEY;

// 1. Audio Analysis 
exports.analyzeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required.' });
        }

        const formData = new FormData();
        formData.append('audio', req.file.buffer, {
            filename: 'interview_audio.wav',
            contentType: req.file.mimetype,
        });

        const flaskResponse = await axios.post(
            `${FLASK_INTERVIEW_URL}/analyze`,
            formData,
            { headers: { ...formData.getHeaders() } }
        );

        res.status(200).json(flaskResponse.data);
    } catch (error) {
        console.error('Audio Analysis Error:', error.message);
        res.status(500).json({ error: 'Failed to analyze audio' });
    }
};

// ----------------------------------------------------------------
// Analyze CV for Interview (reuses job match Flask)
// ----------------------------------------------------------------
exports.analyzeCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a CV (PDF).' });
        }

        console.log('DEBUG: File received ->', req.file.originalname);
        console.log('DEBUG: FLASK_JOB_URL ->', FLASK_JOB_URL);
        console.log('DEBUG: GROQ_KEY exists ->', !!GROQ_KEY);

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });
        formData.append('country', req.body.country || 'lk');
        formData.append('api_key', process.env.SERP_API_KEY || '');
        formData.append('groq_key', GROQ_KEY);

        console.log('DEBUG: Calling Flask ->', `${FLASK_JOB_URL}/analyze-cv-only`);

        const flaskResponse = await axios.post(
            `${FLASK_JOB_URL}/analyze-cv-only`,
            formData,
            { headers: { ...formData.getHeaders() } }
        );

        res.status(200).json(flaskResponse.data);

    } catch (error) {
        // Detailed error logging
        console.error('analyzeCV ERROR:', error.message);
        if (error.response) {
            console.error('Flask response status:', error.response.status);
            console.error('Flask response data:', error.response.data);
            return res.status(error.response.status).json(error.response.data);
        }
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ error: 'Flask server not running on port 5002' });
        }
        res.status(500).json({ error: error.message });
    }
};

// ----------------------------------------------------------------
// Generate Interview Questions
// ----------------------------------------------------------------
exports.generateQuestions = async (req, res) => {
    try {
        const { cv_data, job_description } = req.body;

        if (!cv_data) {
            return res.status(400).json({ error: 'cv_data is required' });
        }

        const flaskResponse = await axios.post(
            `${FLASK_INTERVIEW_URL}/generate-questions`,
            {
                groq_key: GROQ_KEY,
                cv_data: cv_data,
                job_description: job_description || ''
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.status(200).json(flaskResponse.data);

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ----------------------------------------------------------------
// Analyze Interview Answer
// ----------------------------------------------------------------
exports.analyzeAnswer = async (req, res) => {
    try {
        const { text, question, question_type, cv_data, job_description } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Answer text is required' });
        }

        const flaskResponse = await axios.post(
            `${FLASK_INTERVIEW_URL}/analyze-answer`,
            {
                text,
                question: question || '',
                question_type: question_type || 'general',
                groq_key: GROQ_KEY,
                cv_data: cv_data || {},
                job_description: job_description || ''
            },
            { headers: { 'Content-Type': 'application/json' } }
        );

        res.status(200).json(flaskResponse.data);

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};