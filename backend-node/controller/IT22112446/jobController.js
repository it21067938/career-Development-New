const axios = require('axios');
const FormData = require('form-data');

exports.processJobMatch = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a CV (PDF).' });
        }

        const country = req.body.country || 'lk';
        const formData = new FormData();

        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        formData.append('country', country);
        formData.append('api_key', process.env.SERP_API_KEY);
        formData.append('groq_key', process.env.GROQ_API_KEY); // gemini_key → groq_key

        const flaskUrl = process.env.IT22112446_FLASK_JOB_MATCH_URL;

        const flaskResponse = await axios.post(`${flaskUrl}/process-cv`, formData, {
            headers: { ...formData.getHeaders() }
        });

        res.status(200).json(flaskResponse.data);

    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};