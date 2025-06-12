// Enable dotenv debug
process.env.DEBUG = 'dotenv';

// First, log the raw env before loading dotenv
console.log('Before loading dotenv:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('X_BEARER_TOKEN:', process.env.X_BEARER_TOKEN);

const dotenv = require('dotenv');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Looking for .env file...');

const result = dotenv.config();
console.log('Dotenv result:', result);

if (result.error) {
    console.error('Error loading .env file:', result.error.message);
    process.exit(1);
}

console.log('\nEnvironment variables after loading:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
    console.log('Key prefix:', process.env.OPENAI_API_KEY.substring(0, 8));
    console.log('Key length:', process.env.OPENAI_API_KEY.length);
    console.log('Contains "your":', process.env.OPENAI_API_KEY.includes('your'));
}

console.log('\n2. X Bearer Token:');
console.log('   - Exists:', !!process.env.X_BEARER_TOKEN);
if (process.env.X_BEARER_TOKEN) {
    console.log('   - Length:', process.env.X_BEARER_TOKEN.length);
    console.log('   - First few chars:', process.env.X_BEARER_TOKEN.substring(0, 5));
}

// Only proceed with OpenAI test if we have a key
if (process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORG_ID,
        dangerouslyAllowBrowser: true
    });

    (async () => {
        try {
            console.log('Environment check:');
            console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
            console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) : 'none');
            console.log('Organization ID:', process.env.OPENAI_ORG_ID);

            console.log('\nTesting OpenAI connection...');
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'user', content: 'Just say hi if this key works.' }
                ]
            });
            console.log('Response:', response.choices[0].message.content);
        } catch (error) {
            console.error('\nError details:');
            console.error('Type:', error.constructor.name);
            console.error('Message:', error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
        }
    })();
} else {
    console.log('\nNo OpenAI API key found in environment');
}

console.log('Environment variables:');
console.log('1. X Bearer Token:');
console.log('   - Raw value:', process.env.X_BEARER_TOKEN);
console.log('   - Length:', process.env.X_BEARER_TOKEN ? process.env.X_BEARER_TOKEN.length : 0);

console.log('\n2. OpenAI API Key:');
console.log('   - Raw value:', process.env.OPENAI_API_KEY);
console.log('   - Length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0); 