import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeTopic } from './src/services/analyzerService.js';

dotenv.config();

// Set environment variable to indicate web server context
process.env.WEB_SERVER = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verify environment setup
function checkEnvironment() {
    const requiredVars = ['OPENAI_API_KEY'];
    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        console.error('Please check your .env file');
        process.exit(1);
    }
    
    console.log('Environment variables verified successfully');
}

// Check environment before starting
checkEnvironment();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// API Routes
app.post('/api/analyze', async (req, res) => {
    console.log('>>> /api/analyze route hit', req.body);
    try {
        const formData = req.body;
        
        if (!formData.topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        console.log('🎯 Received analysis request:', {
            topic: formData.topic,
            platforms: formData.platforms,
            dateRange: `${formData.since} to ${formData.until}`
        });
        
        // Use the new orchestration function with full form data
        const result = await analyzeTopic(formData);

        res.json(result);
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suggestions', async (req, res) => {
    try {
        const { topic } = req.body;
        
        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        // For now, just return the topic as a suggestion
        res.json({ suggestions: [topic] });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 