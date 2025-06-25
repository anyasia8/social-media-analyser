import OpenAI from 'openai';
import dotenv from 'dotenv';
import { runScweetScraper } from './apifyXSearchService.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to expand the topic using OpenAI in Scweet-compatible format
async function expandTopicWithOpenAI(prompt) {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a social media research assistant. Given a topic, return a JSON object with three arrays: "words_and" (main keywords, all must be present in a tweet), "words_or" (related/optional keywords, at least one must be present), and "hashtag" (relevant hashtags, without the # symbol). Only return valid JSON, no explanation.`
      },
      {
        role: 'user',
        content: `Expand the topic "${prompt}" for Twitter search.`
      }
    ]
  });

  const content = response.choices[0].message.content;
  try {
    const parsed = JSON.parse(content);
    // Ensure all fields are arrays
    return {
      words_and: Array.isArray(parsed.words_and) ? parsed.words_and : [],
      words_or: Array.isArray(parsed.words_or) ? parsed.words_or : [],
      hashtag: Array.isArray(parsed.hashtag) ? parsed.hashtag : []
    };
  } catch (error) {
    console.log('Failed to parse OpenAI response as JSON:', content);
    // Fallback: treat the whole content as a single keyword in words_and
    return {
      words_and: [prompt],
      words_or: [],
      hashtag: []
    };
  }
}

// Function to scrape Twitter data using Apify Scweet
async function scrapeTwitterData(scweetKeywords, options = {}) {
  try {
    const results = await runScweetScraper({
      ...scweetKeywords,
      maxItems: options.maxItems || "20",
      since: options.since || '2024-06-01',
      until: options.until || new Date().toISOString().split('T')[0],
      type: 'Latest',
      min_likes: options.minLikes,
      lang: options.language || 'en',
      ...options
    });
    
    return results;
  } catch (error) {
    console.error('Twitter scraping error:', error);
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
export async function analyzeTopic(formData) {
  try {
    const { topic, since, until, platforms, maxItems, minLikes, language } = formData;
    
    console.log('🔍 Starting analysis for topic:', topic);
    console.log('📅 Date range:', since, 'to', until);
    console.log('🌐 Platforms:', platforms);
    console.log('⚙️ Options:', { maxItems, minLikes, language });
    
    // Step 1: Expand topic with OpenAI
    console.log('📝 Expanding topic...');
    const scweetKeywords = await expandTopicWithOpenAI(topic);
    console.log('🔑 [MAIN] Parsed Scweet keywords:', scweetKeywords);
    
    // Step 2: Scrape data from selected platforms
    let allData = [];
    
    if (platforms.twitter) {
      console.log('🐦 Scraping Twitter data...');
      const twitterData = await scrapeTwitterData(scweetKeywords, {
        since,
        until,
        maxItems,
        minLikes,
        language
      });
      allData = allData.concat(twitterData);
    }
    
    if (platforms.reddit) {
      console.log('📱 Reddit scraping not implemented yet');
      // TODO: Implement Reddit scraping
    }
    
    if (platforms.youtube) {
      console.log('📺 YouTube scraping not implemented yet');
      // TODO: Implement YouTube scraping
    }
    
    // Step 3: Analyze results
    console.log('🧠 Analyzing results...');
    const analysis = await analyzeResults(allData, topic);
    
    return {
      topic,
      scweetKeywords,
      tweets: allData,
      analysis,
      metadata: {
        dateRange: { since, until },
        platforms,
        options: { maxItems, minLikes, language },
        totalResults: allData.length
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
}

export { expandTopicWithOpenAI, scrapeTwitterData, analyzeResults }; 