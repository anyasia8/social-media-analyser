const MCPService = require('./src/services/mcpService');

(async () => {
    const mcpService = new MCPService();
    try {
        const response = await mcpService.testConnection();
        console.log('OpenAI API test response:', JSON.stringify(response, null, 2));
        if (response.choices && response.choices[0].message.content.trim() === 'OK') {
            console.log('✅ OpenAI API connection is working!');
        } else {
            console.log('⚠️ OpenAI API responded, but not as expected:', response.choices[0].message.content);
        }
    } catch (error) {
        console.error('❌ OpenAI API connection failed:', error.message);
    }
})(); 