import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Gemini API...');
console.log('API Key present:', !!process.env.GOOGLE_API_KEY);
console.log('API Key length:', process.env.GOOGLE_API_KEY?.length);

const testPrompt = async () => {
    try {
        console.log('\nTesting simple prompt...');

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const result = await model.generateContent('Say "Hello! I am working correctly." in one sentence.');
        const response = result.response;
        const text = response.text();

        console.log('✓ Success! Response:', text);
        console.log('\nGemini API is working correctly! 🎉');
    } catch (error) {
        console.error('\n✗ Full Error Details:');
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
        process.exit(1);
    }
};

testPrompt();
