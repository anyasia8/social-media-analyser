class MockDataService {
    async searchTweets(query) {
        console.log(`Mock searching for: ${query}`);
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            data: [
                {
                    id: '1',
                    text: `Just launched our new marketing campaign! The vibe is incredible. #Marketing #${query.replace(/\s+/g, '')}`,
                    created_at: new Date().toISOString(),
                    author_id: 'user1',
                    public_metrics: {
                        retweet_count: 42,
                        reply_count: 12,
                        like_count: 156,
                        quote_count: 5
                    }
                },
                {
                    id: '2',
                    text: `Excited to share our latest case study on social media engagement. The results are amazing! Check out how we increased engagement by 300% #SocialMedia #${query.replace(/\s+/g, '')}`,
                    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                    author_id: 'user2',
                    public_metrics: {
                        retweet_count: 28,
                        reply_count: 8,
                        like_count: 95,
                        quote_count: 3
                    }
                },
                {
                    id: '3',
                    text: `Breaking down the latest trends in digital marketing. Key takeaway: authenticity wins! #DigitalMarketing #${query.replace(/\s+/g, '')}`,
                    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                    author_id: 'user3',
                    public_metrics: {
                        retweet_count: 65,
                        reply_count: 15,
                        like_count: 210,
                        quote_count: 8
                    }
                },
                {
                    id: '4',
                    text: `Our team just completed another successful campaign. The client feedback is phenomenal! #Success #${query.replace(/\s+/g, '')}`,
                    created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
                    author_id: 'user4',
                    public_metrics: {
                        retweet_count: 33,
                        reply_count: 9,
                        like_count: 127,
                        quote_count: 4
                    }
                },
                {
                    id: '5',
                    text: `Innovation in marketing never stops. Here's what we learned from our latest A/B testing. Thread 🧵 #MarketingTips #${query.replace(/\s+/g, '')}`,
                    created_at: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
                    author_id: 'user5',
                    public_metrics: {
                        retweet_count: 89,
                        reply_count: 24,
                        like_count: 345,
                        quote_count: 12
                    }
                }
            ],
            meta: {
                result_count: 5,
                newest_id: '1',
                oldest_id: '5'
            },
            includes: {
                users: [
                    { id: 'user1', username: 'marketingpro', name: 'Marketing Pro' },
                    { id: 'user2', username: 'socialmediaguru', name: 'Social Media Guru' },
                    { id: 'user3', username: 'digitalexpert', name: 'Digital Expert' },
                    { id: 'user4', username: 'campaignmaster', name: 'Campaign Master' },
                    { id: 'user5', username: 'innovatormarketing', name: 'Innovator Marketing' }
                ]
            }
        };
    }
}

module.exports = new MockDataService(); 