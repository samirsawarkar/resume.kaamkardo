const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_1 || "sk-live-b5e4c685089f9658422e5cf9f734074c9eaa7311f1e911eacfb713827211f6c5",
  baseURL: "https://api.aicredits.in/v1",
});

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: "z-ai/glm-4.7-flash",
      messages: [{ role: "user", content: "Write a very long essay about the history of the world. At least 2000 words. Keep writing until you reach the end." }],
      max_tokens: 8000,
    });
    console.log("Tokens used:", response.usage);
    console.log("Finish reason:", response.choices[0].finish_reason);
    console.log("Content length:", response.choices[0].message.content.length);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
