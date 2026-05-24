import OpenAI from "openai";
import { extractJson } from "./json-extractor";

let requestCount = 0;
function getRotatedClient() {
  requestCount++;
  const key1 = process.env.OPENAI_API_KEY_1;
  const key2 = process.env.OPENAI_API_KEY_2;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.aicredits.in/v1";
  
  const key = (requestCount % 2 === 0 && key2) ? key2 : (key1 || process.env.OPENAI_API_KEY_1);
  
  return new OpenAI({
    apiKey: key,
    baseURL: baseUrl,
  });
}

/**
 * Robust wrapper for calling AI models with retries, timeouts, and structure enforcement.
 */
export async function callModelWithRetry(
  promptSystem: string,
  promptUser: string,
  modelsToTry: string[],
  maxTokens: number = 2048,
  schemaValidator?: any
): Promise<any> {
  let attempt = 0;
  const maxRetries = 3;
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    attempt++;
    // Rotate model if one fails
    const model = modelsToTry[i % modelsToTry.length];
    
    try {
      console.log(`[AI Client] Attempt ${attempt} with model ${model}`);
      
      const client = getRotatedClient();
      
      // Enforce 180 second timeout per call to prevent hanging but allow deep rewriting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);

      // We explicitly DO NOT use response_format: { type: "json_object" } here 
      // because some models (like glm-4.7-flash) on certain providers return empty 
      // responses when forced. Our json-extractor is robust enough to handle markdown.
      const response = await client.chat.completions.create({
        model: model,
        messages: [
          { role: "system", content: promptSystem },
          { role: "user", content: promptUser }
        ],
        temperature: 0.1, // Lower temperature for more deterministic JSON
        max_tokens: maxTokens,
      }, { signal: controller.signal });

      clearTimeout(timeoutId);

      const rawContent = response.choices[0]?.message?.content;
      if (!rawContent) throw new Error("Empty response from AI.");

      // Robust extraction
      const extractedJson = extractJson(rawContent);

      // Validate against schema if provided
      if (schemaValidator) {
        const parsed = schemaValidator.safeParse(extractedJson);
        if (!parsed.success) {
          throw new Error(`Schema Validation Failed: ${parsed.error.message}`);
        }
        return parsed.data;
      }

      return extractedJson;

    } catch (error: any) {
      lastError = error;
      console.error(`[AI Client] Attempt ${attempt} failed:`, error.message);
      
      // Exponential backoff
      if (i < maxRetries - 1) {
        const backoffMs = Math.pow(2, i) * 1000;
        console.log(`[AI Client] Retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw new Error(`AI Call failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}
