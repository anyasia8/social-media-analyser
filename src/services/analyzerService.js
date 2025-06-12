const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const moment = require('moment');
const { OpenAI } = require('openai');

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

class AnalyzerService {
    constructor() {
        this.cluster = null;
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async initCluster() {
        if (!this.cluster) {
            this.cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_CONTEXT,
                maxConcurrency: 2,
                puppeteerOptions: {
                    headless: 'new',
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--disable-gpu'
                    ]
                },
                monitor: true,
                timeout: 30000
            });
        }
        return this.cluster;
    }

    async generateKeywordSuggestions(topic) {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a social media analysis expert. Generate relevant keywords and hashtags for the given topic."
                    },
                    {
                        role: "user",
                        content: `Generate 5 relevant keywords and hashtags for analyzing social media content about: ${topic}`
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            const suggestions = completion.choices[0].message.content
                .split('\n')
                .filter(k => k.trim())
                .map(k => k.replace(/^\d+\.\s*/, '').trim());

            return suggestions;
        } catch (error) {
            console.error('Error generating keywords:', error);
            return [];
        }
    }

    async findTopInfluencers(topic, count = 5) {
        const cluster = await this.initCluster();
        const influencers = [];

        try {
            await cluster.task(async ({ page, data: searchTerm }) => {
                await page.setViewport({ width: 1200, height: 800 });
                await page.goto(`https://twitter.com/search?q=${encodeURIComponent(searchTerm)}%20min_faves%3A1000&src=typed_query&f=live`);
                
                // Wait for content to load
                await page.waitForSelector('article', { timeout: 10000 });
                await new Promise(r => setTimeout(r, 2000)); // Allow dynamic content to load

                // Extract users from tweets
                const users = await page.evaluate(() => {
                    const articles = document.querySelectorAll('article');
                    const users = new Map();

                    articles.forEach(article => {
                        const userElement = article.querySelector('div[data-testid="User-Name"]');
                        if (userElement) {
                            const name = userElement.textContent;
                            const followersText = article.querySelector('span[data-testid="app-text-transition-container"]')?.textContent;
                            users.set(name, followersText || '0');
                        }
                    });

                    return Array.from(users.entries()).map(([name, followers]) => ({ name, followers }));
                });

                return users;
            });

            const results = await cluster.execute(topic);
            influencers.push(...results.slice(0, count));

        } catch (error) {
            console.error('Error finding influencers:', error);
        }

        return influencers;
    }

    async getTrendingTweets(topic) {
        const cluster = await this.initCluster();
        const tweets = [];

        try {
            await cluster.task(async ({ page, data: searchTerm }) => {
                const searchQuery = `${searchTerm} min_faves:500 until:${moment().format('YYYY-MM-DD')} since:${moment().subtract(7, 'days').format('YYYY-MM-DD')}`;
                await page.setViewport({ width: 1200, height: 800 });
                await page.goto(`https://twitter.com/search?q=${encodeURIComponent(searchQuery)}&src=typed_query&f=live`);
                
                // Wait for content to load
                await page.waitForSelector('article', { timeout: 10000 });
                await new Promise(r => setTimeout(r, 2000)); // Allow dynamic content to load

                // Extract tweets
                const extractedTweets = await page.evaluate(() => {
                    const articles = document.querySelectorAll('article');
                    return Array.from(articles).slice(0, 10).map(article => {
                        const tweetText = article.querySelector('div[data-testid="tweetText"]')?.textContent || '';
                        const timestamp = article.querySelector('time')?.getAttribute('datetime') || '';
                        const likes = article.querySelector('div[data-testid="like"]')?.textContent || '0';
                        const tweetUrl = article.querySelector('a[href*="/status/"]')?.href || '';
                        return { text: tweetText, timestamp, likes, url: tweetUrl };
                    });
                });

                return extractedTweets;
            });

            const results = await cluster.execute(topic);
            tweets.push(...results);

        } catch (error) {
            console.error('Error getting trending tweets:', error);
        }

        return tweets;
    }

    async generateSummaryAnalysis(topic, tweets) {
        try {
            const tweetTexts = tweets.map(t => t.text).join('\n');
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a social media trend analyst. Analyze the given tweets and provide a concise summary."
                    },
                    {
                        role: "user",
                        content: `Analyze these tweets about ${topic} and provide a brief summary of the main trends and sentiments:\n\n${tweetTexts}`
                    }
                ],
                model: "gpt-3.5-turbo",
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('Error generating summary:', error);
            return 'Unable to generate summary at this time.';
        }
    }

    async cleanup() {
        if (this.cluster) {
            await this.cluster.close();
            this.cluster = null;
        }
    }
}

module.exports = new AnalyzerService(); 