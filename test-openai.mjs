import OpenAI from "openai";
import * as dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

console.log("Testing OpenAI connection...");
console.log("API Key (first 4 chars):", process.env.OPENAI_API_KEY.slice(0, 4));

try {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "user", content: "Just say hi if this key works." }
    ]
  });

  console.log("✅ Success:", response.choices[0].message.content);
} catch (error) {
  console.error("❌ Error:", error.message);
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
  }
} 