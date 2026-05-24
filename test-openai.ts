
import OpenAI from "openai";

async function main() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY_1 || process.env.OPENAI_API_KEY_2,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1",
  });

  try {
    const res = await openai.chat.completions.create({
      model: "prime-intellect/intellect-3",
      messages: [{ role: "user", content: "Say hello" }]
    });
    console.log("SUCCESS:");
    console.log(res.choices[0]?.message?.content);
  } catch (err: any) {
    console.log("ERROR:", err.message);
  }
}

main();
