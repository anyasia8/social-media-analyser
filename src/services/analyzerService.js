import OpenAI from 'openai';
import dotenv from 'dotenv';
import { runScweetScraper } from './apifyXSearchService.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to expand the topic using OpenAI
async function expandTopicWithOpenAI(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that expands topics into clusters, keywords, and platform-specific queries. Return a JSON object with three arrays: words_and, words_or, and hashtag. Example: { "words_and": ["bitcoin", "price"], "words_or": ["cryptocurrency", "market"], "hashtag": ["btc", "crypto"] }' },
      { role: 'user', content: `Expand this topic into relevant keywords for social media analysis. Return a JSON object with words_and, words_or, and hashtag arrays. Topic: ${prompt}` }
    ]
  });

  return response.choices[0].message.content;
}

// Function to scrape Twitter data using Apify Scweet
async function scrapeTwitterData(keywords, options = {}) {
  console.log('🐦 [ANALYZER] Starting scrapeTwitterData function');
  console.log('📋 [ANALYZER] Keywords received:', keywords);
  console.log('⚙️ [ANALYZER] Options received:', JSON.stringify(options, null, 2));
  
  try {
    console.log('📞 [ANALYZER] Calling runScweetScraper...');
    // Destructure the keywords object to pass correct fields
    const { words_and = [], words_or = [], hashtag = [] } = keywords;
    const results = await runScweetScraper({
      words_and,
      words_or,
      hashtag,
      maxItems: "20",
      since: options.since || '2024-06-01',
      type: 'Latest',
      ...options
    });
    
    console.log('✅ [ANALYZER] runScweetScraper completed successfully');
    console.log('📊 [ANALYZER] Results type:', typeof results);
    console.log('📊 [ANALYZER] Results is array:', Array.isArray(results));
    console.log('📊 [ANALYZER] Results length:', results ? results.length : 'undefined');
    
    if (results && results.length > 0) {
      console.log('📝 [ANALYZER] Sample result item:', JSON.stringify(results[0], null, 2));
    } else {
      console.log('⚠️ [ANALYZER] No results returned from scraper');
    }
    
    console.log('📤 [ANALYZER] Returning results to caller');
    return results;
  } catch (error) {
    console.error('💥 [ANALYZER] Twitter scraping error:', error);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    return [];
  }
}

// Function to analyze the results using OpenAI
async function analyzeResults(rawData, topic) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a social media analyst. Analyze the provided tweets and provide insights about trends, sentiment, and key themes.' },
      { role: 'user', content: `Analyze these tweets about "${topic}" and provide a summary of key insights: ${JSON.stringify(rawData.slice(0, 10))}` }
    ]
  });

  return response.choices[0].message.content;
}

// Main orchestration function
export async function analyzeTopic(topic) {
  console.log('🎯 [MAIN] Starting analyzeTopic function');
  console.log('📝 [MAIN] Topic received:', topic);
  
  try {
    console.log('🔍 [MAIN] Starting analysis for topic:', topic);
    
    // Step 1: Expand topic with OpenAI
    console.log('📝 [MAIN] Expanding topic...');
    const expandedKeywords = await expandTopicWithOpenAI(topic);
    console.log('✅ [MAIN] Topic expansion completed');
    console.log('📋 [MAIN] Expanded keywords raw:', expandedKeywords);
    
    const keywords = JSON.parse(expandedKeywords);
    console.log('🔑 [MAIN] Parsed keywords:', keywords);
    
    // Step 2: Scrape Twitter data
    console.log('🐦 [MAIN] Scraping Twitter data...');
    const twitterData = await scrapeTwitterData(keywords);
    console.log('✅ [MAIN] Twitter scraping completed');
    console.log('📊 [MAIN] Twitter data length:', twitterData ? twitterData.length : 'undefined');
    
    // Step 3: Analyze results
    console.log('🧠 [MAIN] Analyzing results...');
    const analysis = await analyzeResults(twitterData, topic);
    console.log('✅ [MAIN] Analysis completed');
    
    const result = {
      topic,
      scweetKeywords: keywords, // for UI clarity
      tweets: twitterData,
      analysis,
      timestamp: new Date().toISOString()
    };
    
    console.log('🎉 [MAIN] Analysis completed successfully');
    console.log('📊 [MAIN] Final result summary:');
    console.log('   - Topic:', result.topic);
    console.log('   - Keywords object:', result.scweetKeywords);
    console.log('   - Tweets count:', result.tweets ? result.tweets.length : 0);
    console.log('   - Analysis length:', result.analysis ? result.analysis.length : 0);
    console.log('📤 [MAIN] Returning final result');
    
    return result;
    
  } catch (error) {
    console.error('💥 [MAIN] Analysis error:', error);
    console.error('   Error type:', error.constructor.name);
    console.error('   Error message:', error.message);
    console.error('   Error stack:', error.stack);
    throw error;
  }
}

export { expandTopicWithOpenAI, scrapeTwitterData, analyzeResults }; 