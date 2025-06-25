// Apify X Search Service (Scweet MCP)
// Accepts expanded keywords + date range, runs Apify Scweet actor, returns raw tweet data

import { Actor, Dataset } from 'apify';
import dotenv from 'dotenv';
dotenv.config();

// Scweet Actor ID
const SCWEET_ACTOR_ID = 'EvFXOhwR6wsOWmdSK';

// Debug: Check if APIFY_TOKEN is loaded
console.log('APIFY_TOKEN loaded:', process.env.APIFY_TOKEN ? 'YES' : 'NO');
console.log('APIFY_TOKEN first 8 chars:', process.env.APIFY_TOKEN ? process.env.APIFY_TOKEN.slice(0, 8) : 'NOT FOUND');

/**
 * Runs the Scweet Twitter/X scraper on Apify.
 * 
 * @param {Object} options
 * @param {string[]} [options.words_and] - Required words in tweet
 * @param {string[]} [options.words_or] - At least one of these must be in tweet
 * @param {string[]} [options.hashtag] - Hashtags to include
 * @param {string} [options.from_user] - Tweets from this user
 * @param {string} [options.to_user] - Tweets to this user
 * @param {number} [options.min_likes]
 * @param {string} [options.min_replies]
 * @param {string} [options.min_retweets]
 * @param {string} [options.lang]
 * @param {string} [options.since] - Format: YYYY-MM-DD
 * @param {string} [options.until] - Format: YYYY-MM-DD
 * @param {string} [options.type] - "Top" or "Latest"
 * @param {number} [options.maxItems]
 * @param {string} [options.geocode]
 * @param {string} [options.place]
 * @param {string} [options.near]
 */
export async function runScweetScraper(options = {}) {
    console.log('🚀 [SCRAPER] Starting runScweetScraper function');
    console.log('📋 [SCRAPER] Received options:', JSON.stringify(options, null, 2));
    
    try {
        console.log('🔧 [SCRAPER] Initializing Actor...');
        await Actor.init();
        console.log('✅ [SCRAPER] Actor initialized successfully');

        const input = {
            words_and: options.words_and || [],
            words_or: options.words_or || [],
            hashtag: options.hashtag || [],
            from_user: options.from_user || undefined,
            to_user: options.to_user || undefined,
            min_likes: options.min_likes !== undefined && options.min_likes !== '' ? parseInt(options.min_likes, 10) : undefined,
            min_replies: options.min_replies !== undefined && options.min_replies !== '' ? parseInt(options.min_replies, 10) : undefined,
            min_retweets: options.min_retweets !== undefined && options.min_retweets !== '' ? parseInt(options.min_retweets, 10) : undefined,
            lang: options.lang || 'en',
            since: options.since || '2024-06-01',
            until: options.until || new Date().toISOString().split('T')[0],
            type: options.type || 'Top',
            maxItems: options.maxItems !== undefined && options.maxItems !== '' ? String(options.maxItems) : "100",
            geocode: options.geocode || undefined,
            place: options.place || undefined,
            near: options.near || undefined,
        };

        console.log('🎯 [SCRAPER] Prepared input configuration:');
        console.log('   - words_and:', input.words_and);
        console.log('   - words_or:', input.words_or);
        console.log('   - hashtag:', input.hashtag);
        console.log('   - since:', input.since);
        console.log('   - until:', input.until);
        console.log('   - type:', input.type);
        console.log('   - maxItems:', input.maxItems);
        console.log('   - lang:', input.lang);

        console.log('🔑 [SCRAPER] Checking APIFY_TOKEN...');
        if (process.env.APIFY_TOKEN) {
            console.log('✅ [SCRAPER] APIFY_TOKEN found in environment');
            Actor.config.set('APIFY_TOKEN', process.env.APIFY_TOKEN);
            console.log('✅ [SCRAPER] APIFY_TOKEN set in Actor config');
        } else {
            console.error('❌ [SCRAPER] APIFY_TOKEN not found in environment variables');
            throw new Error('APIFY_TOKEN environment variable is required');
        }

        console.log('📞 [SCRAPER] Calling Apify actor with ID:', SCWEET_ACTOR_ID);
        console.log('⏳ [SCRAPER] This may take several minutes...');
        
        const run = await Actor.call(SCWEET_ACTOR_ID, input);
        console.log('📊 [SCRAPER] Actor call completed');
        console.log('📈 [SCRAPER] Run status:', run.status);
        console.log('🆔 [SCRAPER] Run ID:', run.id);
        console.log('📅 [SCRAPER] Run started at:', run.startedAt);
        console.log('⏰ [SCRAPER] Run finished at:', run.finishedAt);

        if (run.status !== 'SUCCEEDED') {
            console.error('❌ [SCRAPER] Actor run failed with status:', run.status);
            console.error('📋 [SCRAPER] Run details:', JSON.stringify(run, null, 2));
            throw new Error(`Scweet run failed with status: ${run.status}`);
        }

        console.log('✅ [SCRAPER] Actor run succeeded!');
        console.log('📦 [SCRAPER] Dataset ID:', run.defaultDatasetId);
        
        console.log('🔓 [SCRAPER] Opening dataset...');
        const dataset = await Dataset.open(run.defaultDatasetId);
        console.log('✅ [SCRAPER] Dataset opened successfully');
        
        console.log('📥 [SCRAPER] Retrieving data from dataset...');
        const { items } = await dataset.getData();
        console.log('✅ [SCRAPER] Data retrieved from dataset');
        console.log('📊 [SCRAPER] Raw items type:', typeof items);
        console.log('📊 [SCRAPER] Raw items length:', items ? items.length : 'undefined');
        console.log('📊 [SCRAPER] Raw items is array:', Array.isArray(items));
        
        if (items && items.length > 0) {
            console.log('📝 [SCRAPER] Sample of first item:', JSON.stringify(items[0], null, 2));
        } else {
            console.log('⚠️ [SCRAPER] No items found in dataset');
        }
        
        console.log('🚪 [SCRAPER] Exiting Actor...');
        // Only exit Actor if we're not in a web server context
        // This prevents the entire Node.js process from crashing
        if (process.env.NODE_ENV !== 'production' && !process.env.WEB_SERVER) {
            await Actor.exit();
            console.log('✅ [SCRAPER] Actor exited successfully');
        } else {
            console.log('⚠️ [SCRAPER] Skipping Actor.exit() in web server context');
        }

        console.log(`🎉 [SCRAPER] Scweet fetched ${items ? items.length : 0} tweets.`);
        return items || [];
    } catch (error) {
        // ... existing error handling ...
    }
}