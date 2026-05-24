// ═══════════════════════════════════════════════════════════════
// lib/core/response-rescue.ts
// Level 1 Defense: Operates strictly on raw strings before parsing.
// Handles markdown, preamble, truncation, and common JSON syntax errors.
// ═══════════════════════════════════════════════════════════════

export function rescueRawResponse(raw: string): string {
  if (!raw || typeof raw !== 'string') return "{}";

  try {
    let text = raw.trim();

    // 1. Strip markdown fences (matches ```json, ```, etc. anywhere at start/end)
    text = text.replace(/^```[a-z]*\s*/i, '');
    text = text.replace(/\s*```$/i, '');

    // 2. Strip preamble — slice from first { or [ character
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
      startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
    } else if (firstBracket !== -1) {
      startIdx = firstBracket;
    }

    if (startIdx !== -1) {
      text = text.slice(startIdx);
    } else {
      return "{}"; // Completely unrecognizable, no JSON structure
    }

    // 3. Strip trailing text — slice to last } or ] character
    const lastBrace = text.lastIndexOf('}');
    const lastBracket = text.lastIndexOf(']');
    let endIdx = -1;
    if (lastBrace !== -1 && lastBracket !== -1) {
      endIdx = Math.max(lastBrace, lastBracket);
    } else if (lastBrace !== -1) {
      endIdx = lastBrace;
    } else if (lastBracket !== -1) {
      endIdx = lastBracket;
    }

    if (endIdx !== -1) {
      text = text.slice(0, endIdx + 1);
    }

    // 5. Normalize escaped characters that break JSON.parse()
    
    // Fix: trailing commas before } or ]
    text = text.replace(/,\s*\}/g, '}');
    text = text.replace(/,\s*\]/g, ']');

    // Fix: undefined values (replace with null)
    text = text.replace(/:\s*undefined\b/g, ': null');

    // Fix: single quotes instead of double quotes (naive fix for keys and simple values)
    // Matches keys: 'myKey': 
    text = text.replace(/(\s*)'([^']+)'(\s*:)/g, '$1"$2"$3');
    // Matches values: : 'myValue'
    text = text.replace(/:\s*'([^']+)'/g, ': "$1"');

    // Fix: unescaped quotes inside strings 
    // Example: "Responsible for "key" metrics" -> "Responsible for \"key\" metrics"
    // Heuristic: A quote surrounded by word characters or spaces, not bordering structural JSON chars
    text = text.replace(/([a-zA-Z0-9\s])"([a-zA-Z0-9\s])/g, '$1\\"$2');

    // 4. Fix truncated JSON
    // We walk the string to see what brackets are left open
    let inString = false;
    let escapeNext = false;
    const stack: string[] = [];

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (ch === '\\') {
        escapeNext = true;
        continue;
      }

      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (inString) continue;

      if (ch === '{') {
        stack.push('}');
      } else if (ch === '[') {
        stack.push(']');
      } else if (ch === '}' || ch === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === ch) {
          stack.pop();
        }
      }
    }

    // If we hit the end and we are still inside a string, close the string first
    if (inString) {
      text += '"';
    }

    // If the stack has unclosed brackets, pop and append them
    // Example: stack has ['}', ']'] -> we append ']' then '}'
    while (stack.length > 0) {
      text += stack.pop();
    }

    return text;
  } catch (err) {
    // If anything goes catastrophically wrong during regex or scanning, 
    // never throw. Return empty object so the coercer can take over.
    return "{}";
  }
}
