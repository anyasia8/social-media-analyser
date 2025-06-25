import { runScweetScraper } from './src/services/apifyXSearchService.js';

console.log('🚀 Starting Scweet test...');
console.log('Testing Scweet Twitter/X scraper...');
console.log('This may take a few minutes as the Apify actor runs...');

try {
  console.log('📞 Calling runScweetScraper...');
  // Test with a simple search for "AI" tweets
  const results = await runScweetScraper({
    words_and: ['AI'],
    maxItems: "5", // Limit to 5 tweets for testing (as a string)
    since: '2024-06-01',
    type: 'Latest'
  });

  console.log('✅ Scweet test successful!');
  console.log(`Found ${results.length} tweets:`);
  
  if (results.length === 0) {
    console.log('No tweets found. This might be normal for the search criteria.');
  } else {
    // Display first few tweets
    results.slice(0, 3).forEach((tweet, index) => {
      console.log(`\nTweet ${index + 1}:`);
      console.log(`- Text: ${tweet.text?.substring(0, 100)}...`);
      console.log(`- User: ${tweet.user?.username}`);
      console.log(`- Likes: ${tweet.likes}`);
      console.log(`- Date: ${tweet.date}`);
    });
  }

} catch (error) {
  console.error('❌ Scweet test failed:', error.message);
  if (error.response) {
    console.error('Response:', error.response);
  }
} 