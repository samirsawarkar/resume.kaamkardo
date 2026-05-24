import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-live-44a8f2d0f9008c34cb38ec5d9849254d585aff0c11252d6f33fea291fb2b2508",
  baseURL: "https://api.aicredits.in/v1",
});

async function test() {
  const largeText = "This is a dummy resume text. ".repeat(200); // 5800 chars
  const prompt = `You are the world's most precise ATS resume analyst...
  RETURN THIS EXACT JSON:
  { "score": 100 }
  RESUME TEXT:
  ${largeText}`;

  console.log("Sending request to aicredits.in with large text...");
  try {
    const res = await openai.chat.completions.create({
      model: "z-ai/glm-4.7-flash",
      messages: [
        { role: "system", content: "You are a strict ATS resume grader. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1500,
    });
    console.log("FULL RAW RESPONSE:");
    console.log(JSON.stringify(res, null, 2));
  } catch (e: any) {
    console.error("ERROR:", e.response?.data || e.message);
  }
}

test();
