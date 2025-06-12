// First, log the raw env before loading dotenv
console.log('Before loading dotenv:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('X_BEARER_TOKEN:', process.env.X_BEARER_TOKEN);

// Now load dotenv
require('dotenv').config();

console.log('\nAfter loading dotenv:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
console.log('X_BEARER_TOKEN:', process.env.X_BEARER_TOKEN);

// Log the actual contents of process.env
console.log('\nAll environment variables:');
Object.keys(process.env).forEach(key => {
    if (key.includes('API') || key.includes('TOKEN')) {
        console.log(`${key}: ${process.env[key]}`);
    }
}); 