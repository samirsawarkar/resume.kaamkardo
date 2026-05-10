import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "sk-of-FWHINAXXrGNxrifuynutXuzlZTaXHUOYeuHaUZCxuaLxFrTRYrvxXNsfUmXjQyTN",
  baseURL: "https://api.ofox.ai/v1",
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: "z-ai/glm-4.7-flash:free",
      messages: [
        {
          role: "system",
          content: "You are a strict ATS resume grader. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: "This is a test prompt.",
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("API Error:", error.message, error.response?.data);
  }
}

main();
