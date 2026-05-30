import { llm } from "../config/llm";

async function testAI() {
  const response = await llm.invoke(
    "Hello, tell me who is best for backend development"
  );

  console.log(response.content);
}

testAI();