import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

console.log("API Key:", process.env.OPENAI_API_KEY ? "exists" : "missing");
console.log("Org ID:", process.env.OPENAI_ORG_ID ? "exists" : "missing"); 