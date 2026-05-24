import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-live-b5e4c685089f9658422e5cf9f734074c9eaa7311f1e911eacfb713827211f6c5",
  baseURL: "https://api.aicredits.in/v1",
});

async function run() {
  try {
    const res = await openai.chat.completions.create({
      model: "z-ai/glm-4-32b",
      messages: [{ role: "user", content: "Reply with JSON: { 'test': 'value' }" }],
      response_format: { type: "json_object" }
    });
    console.log("GLM WITH FORMAT:", res.choices[0].message.content);
  } catch (e: any) {
    console.error("GLM FORMAT ERROR:", e.message);
    try {
      const res2 = await openai.chat.completions.create({
        model: "z-ai/glm-4-32b",
        messages: [{ role: "user", content: "Reply with JSON: { 'test': 'value' }" }]
      });
      console.log("GLM WITHOUT FORMAT:", res2.choices[0].message.content);
    } catch (e2: any) {
      console.error("GLM NO FORMAT ERROR:", e2.message);
    }
  }
}
run();
