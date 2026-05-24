import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "sk-live-44a8f2d0f9008c34cb38ec5d9849254d585aff0c11252d6f33fea291fb2b2508",
  baseURL: "https://api.aicredits.in/v1",
});

async function test() {
  const resumeText = "John Doe\nSoftware Engineer\n5 years experience. Built a bunch of apps using React and Node.js. Improved performance by 20%.";
  const jdText = "Looking for a React developer with 3 years experience.";

  const prompt = `You are the world's most precise ATS resume analyst... (dummy prompt)
  RETURN THIS EXACT JSON:
  {
    "score": 100,
    "grade": "A",
    "data_quality": { "truncated": false, "truncation_note": null, "extraction_confidence": "high" },
    "domain": "Software",
    "level": "Mid",
    "fit_roles": ["Engineer"],
    "jd_match": { "enabled": true, "match_score": 100, "matched_keywords": [], "missing_keywords": [] },
    "salary": { "current_projection": "10L", "real_potential": "12L", "gap_reason": "none" },
    "brutal_truth": ["1","2","3","4"],
    "top_skills": ["React"],
    "missing_skills": ["Node"],
    "quick_fixes": ["1","2","3"],
    "section_scores": { "keywords": 20, "achievements": 20, "formatting": 15, "summary": 10, "experience": 15, "education": 10, "skills": 10 },
    "score_audit": "all good"
  }
  RESUME TEXT:
  ${resumeText}`;

  console.log("Sending request...");
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
