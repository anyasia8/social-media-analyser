const express = require('express');
const xApiService = require('./services/xApiService');
const mcpService = require('./services/mcpService');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { query, maxResults = 100 } = req.body;
        
        // Fetch tweets
        const tweets = await xApiService.searchTweets(query, maxResults);
        
        // Process with MCP
        const analysis = await mcpService.processTweets(tweets.data);
        
        // Get sentiment analysis
        const sentiment = await mcpService.analyzeSentiment(tweets.data);
        
        res.json({
            success: true,
            data: {
                tweets: tweets.data,
                analysis,
                sentiment
            }
        });
    } catch (error) {
        console.error('Error in analysis:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/trends', async (req, res) => {
    try {
        const trends = await xApiService.analyzeTrends();
        res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 