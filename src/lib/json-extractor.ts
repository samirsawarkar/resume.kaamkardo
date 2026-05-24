export function extractJson(raw: string): any {
  if (!raw || !raw.trim()) throw new Error("Empty response");
  
  // 1. Strip markdown fences if present
  let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  
  // Try to parse directly
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // 2. Find the first perfectly balanced { ... } object
  const firstBrace = cleaned.indexOf('{');
  if (firstBrace !== -1) {
    let openBraces = 0;
    let inString = false;
    let escapeNext = false;
    let balancedEnd = -1;

    for (let i = firstBrace; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (escapeNext) { escapeNext = false; continue; }
      if (char === '\\') { escapeNext = true; continue; }
      if (char === '"') { inString = !inString; continue; }
      
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') {
          openBraces--;
          if (openBraces === 0) {
            balancedEnd = i;
            break;
          }
        }
      }
    }
    
    if (balancedEnd !== -1) {
      const candidate = cleaned.substring(firstBrace, balancedEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {}
      
      // If candidate still fails (e.g. trailing comma inside), we try fixing trailing commas on the candidate
      const fixedCandidate = candidate.replace(/,\s*([\]}])/g, '$1');
      try {
        return JSON.parse(fixedCandidate);
      } catch (e) {}
    }
  }

  // 3. Extract best-effort substring (first { to last })
  const startIndex = cleaned.indexOf('{');
  const endIndex = cleaned.lastIndexOf('}');
  
  if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
    try {
      return JSON.parse(cleaned);
    } catch (e) {}
  }

  // 4. Fix trailing commas (common issue)
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(cleaned);
  } catch (e) {}

  // 5. Fallback for truncated JSON (bracket matching recovery)
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\') { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    
    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces = Math.max(0, openBraces - 1);
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets = Math.max(0, openBrackets - 1);
    }
  }

  if (inString) cleaned += '"';
  
  // If we ended on a dangling key or incomplete value, remove the last trailing comma if any
  cleaned = cleaned.replace(/,\s*$/, '');
  
  while (openBrackets > 0) { cleaned += ']'; openBrackets--; }
  while (openBraces > 0) { cleaned += '}'; openBraces--; }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Completely failed to parse JSON from raw:", raw);
    
    // Store failed output locally if possible (Next.js server environments)
    try {
      const fs = require('fs');
      const path = require('path');
      const logDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
      fs.appendFileSync(path.join(logDir, 'failed_json.log'), `\n\n--- [${new Date().toISOString()}] ---\n${raw}\n\n`);
    } catch (fsErr) { /* ignore */ }

    throw new Error(`Failed to parse JSON. Raw output: ${raw.substring(0, 100)}...`);
  }
}
