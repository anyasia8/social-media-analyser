const { TwitterApi } = require('twitter-api-v2');
const dotenv = require('dotenv');

dotenv.config();

class XApiService {
    constructor() {
        const token = process.env.X_BEARER_TOKEN;
        if (!token) {
            throw new Error('X_BEARER_TOKEN is not set in environment variables');
        }
        
        // Initialize with Bearer Token
        this.client = new TwitterApi(token);
        this.readOnlyClient = this.client.readOnly;
    }

    async searchTweets(query, maxResults = 10) {
        try {
            // Using Recent Search endpoint (v2/tweets/search/recent)
            // Rate limit: 180 requests per 15-minute window for Basic tier
            const tweets = await this.readOnlyClient.v2.search(query, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'public_metrics', 'context_annotations'],
                'user.fields': ['username', 'public_metrics'],
                expansions: ['author_id'],
            });

            // Check rate limit info
            if (tweets._rateLimit) {
                console.log('Rate limit info:', {
                    remaining: tweets._rateLimit.remaining,
                    limit: tweets._rateLimit.limit,
                    reset: new Date(tweets._rateLimit.reset * 1000).toLocaleString()
                });
            }

            // Ensure we return an array even if no tweets found
            return {
                data: tweets.data || [],
                meta: tweets.meta,
                includes: tweets.includes
            };
        } catch (error) {
            if (error.code === 429) {
                const resetTime = error.rateLimit?.reset ? 
                    new Date(error.rateLimit.reset * 1000).toLocaleString() :
                    'unknown';
                console.error(`Rate limit exceeded. Resets at: ${resetTime}`);
            }
            throw error;
        }
    }

    async getUserTweets(userId, maxResults = 10) {
        try {
            // Using User Timeline endpoint (v2/users/:id/tweets)
            // Rate limit: 1500 requests per 15-minute window for Basic tier
            const tweets = await this.readOnlyClient.v2.userTimeline(userId, {
                max_results: maxResults,
                'tweet.fields': ['created_at', 'public_metrics'],
            });

            return {
                data: tweets.data || [],
                meta: tweets.meta
            };
        } catch (error) {
            console.error('Error fetching user tweets:', error);
            throw error;
        }
    }

    async analyzeTrends() {
        try {
            // Let's try a simple search query instead of trends
            const tweets = await this.readOnlyClient.v2.search('news');
            return tweets;
        } catch (error) {
            console.error('Error fetching trends:', error);
            throw error;
        }
    }
}

module.exports = new XApiService(); 