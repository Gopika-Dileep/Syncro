import { ChatGroq } from "@langchain/groq";
import { env } from "./env";

export const llm = new ChatGroq({
  model: "llama-3.1-8b-instant", 
  apiKey: env.GROQ_API_KEY,
  temperature: 0.3,
});