const express = require('express');
const path = require('path');
const analyzerService = require('./src/services/analyzerService');
const app = express();
const port = 3000;

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
        const { topic } = req.body;
        
        // Run all analyses in parallel
        const [influencers, tweets] = await Promise.all([
            analyzerService.findTopInfluencers(topic),
            analyzerService.getTrendingTweets(topic)
        ]);

        // Generate summary after getting tweets
        const summary = await analyzerService.generateSummaryAnalysis(topic, tweets);

        res.json({
            influencers,
            tweets,
            summary
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/suggestions', async (req, res) => {
    try {
        const { topic } = req.body;
        const keywords = await analyzerService.generateKeywordSuggestions(topic);
        res.json({ keywords });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 