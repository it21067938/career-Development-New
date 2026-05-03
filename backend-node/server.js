require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const jobRoutes       = require('./routes/IT22112446/jobRoutes');
const interviewRoutes = require('./routes/IT22112446/interviewRoutes');  
const multer = require('multer');

const app    = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/job-match',  jobRoutes);
app.use('/api/interview',  interviewRoutes);  

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Node Gateway running on port ${PORT}`);
});