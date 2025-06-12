const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class MCPService {
    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
            throw new Error('OpenAI API key is not set in environment variables');
        }

        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }

    async testConnection() {
        try {
            console.log('Testing OpenAI connection with GPT-4...');
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "user",
                        content: "Hello, this is a test message. Please respond with 'OK' if you receive this."
                    }
                ],
                max_tokens: 5
            });
            console.log('OpenAI Connection Test Successful');
            return response;
        } catch (error) {
            console.error('\nOpenAI Connection Test Failed:');
            console.error('Error Type:', error.constructor.name);
            console.error('Error Message:', error.message);
            
            if (error.response) {
                console.error('Response Status:', error.response.status);
                console.error('Response Data:', error.response.data);
            }
            
            // Check specific error conditions
            if (error.message.includes('401')) {
                console.error('\nAuthentication Error Details:');
                console.error('- Your API key may not have access to GPT-4');
                console.error('- Check if your OpenAI account has GPT-4 API access enabled');
                console.error('- Verify your API key has the correct permissions');
            }
            
            throw error;
        }
    }

    async processTweets(tweets) {
        // First test the connection
        try {
            await this.testConnection();
        } catch (error) {
            console.error('Connection test failed, aborting tweet processing');
            throw error;
        }

        // Validate tweets input
        if (!Array.isArray(tweets)) {
            console.error('Invalid tweets data:', tweets);
            throw new Error('Expected tweets to be an array');
        }

        if (tweets.length === 0) {
            return {
                analysis: "No tweets found to analyze.",
                rawContext: []
            };
        }

        // Prepare the context for MCP
        const context = tweets.map(tweet => {
            if (!tweet || typeof tweet !== 'object') {
                console.warn('Invalid tweet object:', tweet);
                return null;
            }

            return {
                content: tweet.text || '',
                metadata: {
                    created_at: tweet.created_at || null,
                    metrics: tweet.public_metrics || {},
                    author: tweet.author_id || null
                }
            };
        }).filter(Boolean);

        if (context.length === 0) {
            return {
                analysis: "Could not extract valid data from tweets.",
                rawContext: []
            };
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are analyzing social media data using the Model Context Protocol. Process the following tweets and extract key insights, trends, and patterns."
                    },
                    {
                        role: "user",
                        content: JSON.stringify(context)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            });

            return {
                analysis: completion.choices[0].message.content,
                rawContext: context
            };
        } catch (error) {
            console.error('Error in MCP processing:', error);
            if (error.message.includes('401')) {
                console.error('\nGPT-4 Access Error:');
                console.error('- Verify that your OpenAI account has GPT-4 API access');
                console.error('- Check if you need to request GPT-4 API access from OpenAI');
            }
            throw error;
        }
    }

    async analyzeSentiment(tweets) {
        // Validate tweets input
        if (!Array.isArray(tweets)) {
            console.error('Invalid tweets data for sentiment analysis:', tweets);
            throw new Error('Expected tweets to be an array');
        }

        if (tweets.length === 0) {
            return "No tweets available for sentiment analysis.";
        }

        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "Analyze the sentiment of the following tweets. Provide a detailed breakdown of positive, negative, and neutral sentiments, along with key emotional indicators."
                    },
                    {
                        role: "user",
                        content: JSON.stringify(tweets)
                    }
                ],
                temperature: 0.5
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error in sentiment analysis:', error);
            throw error;
        }
    }
}

module.exports = new MCPService(); 