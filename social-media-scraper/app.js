require('dotenv').config();
const express = require('express');
const path = require('path');
const mockDataService = require('./src/services/mockDataService');
const mcpService = require('./src/services/mcpService');

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
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query is required'
            });
        }

        // Use mock data instead of real X API
        const tweets = await mockDataService.searchTweets(query);
        
        // Process with MCP
        const analysis = await mcpService.processTweets(tweets.data);

        res.json({
            success: true,
            data: {
                tweets: tweets.data,
                analysis: analysis.analysis,
                meta: tweets.meta,
                includes: tweets.includes
            }
        });
    } catch (error) {
        console.error('Error in analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'An error occurred during analysis'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 