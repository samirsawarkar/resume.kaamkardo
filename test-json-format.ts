import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-live-b5e4c685089f9658422e5cf9f734074c9eaa7311f1e911eacfb713827211f6c5",
  baseURL: "https://api.aicredits.in/v1",
});

async function run() {
  try {
    const res = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-lite-preview-09-2025",
      messages: [{ role: "user", content: "Reply with JSON: { 'test': 'value' }" }],
      response_format: { type: "json_object" }
    });
    console.log(res.choices[0].message.content);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
run();
