const xApiService = require('./services/xApiService');

async function testConnection() {
    try {
        console.log('Searching for Vibe Marketing related tweets...');
        
        // Simple search query
        const searchResults = await xApiService.searchTweets('vibe marketing', 10);
        
        if (searchResults.data && searchResults.data.length > 0) {
            console.log(`Found ${searchResults.data.length} relevant tweets:`);
            searchResults.data.forEach((tweet, index) => {
                console.log(`\n${index + 1}. Tweet:`);
                console.log(`Text: ${tweet.text}`);
                if (tweet.public_metrics) {
                    console.log('Metrics:', JSON.stringify(tweet.public_metrics, null, 2));
                }
                console.log('Created at:', tweet.created_at);
                console.log('---');
            });
        } else {
            console.log('No relevant tweets found in the recent results.');
        }

        // If we hit rate limits, show when we can try again
        if (searchResults._rateLimit) {
            const resetTime = new Date(searchResults._rateLimit.reset * 1000);
            console.log(`\nRate limit info:`);
            console.log(`Remaining requests: ${searchResults._rateLimit.remaining}`);
            console.log(`Reset time: ${resetTime.toLocaleString()}`);
        }
    } catch (error) {
        console.error('Search failed!');
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);
        if (error.data) {
            console.error('API Error details:', JSON.stringify(error.data, null, 2));
        }
        
        // If we hit rate limits, show when we can try again
        if (error.rateLimit) {
            const resetTime = new Date(error.rateLimit.reset * 1000);
            console.log(`\nRate limit will reset at: ${resetTime.toLocaleString()}`);
        }
    }
}

testConnection(); 