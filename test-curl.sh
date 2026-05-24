#!/bin/bash
curl -s -X POST "https://api.aicredits.in/v1/chat/completions" \
  -H "Authorization: Bearer sk-live-44a8f2d0f9008c34cb38ec5d9849254d585aff0c11252d6f33fea291fb2b2508" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "z-ai/glm-4.7-flash",
    "messages": [
      {"role": "system", "content": "You are a strict ATS resume grader. Always respond with valid JSON only."},
      {"role": "user", "content": "Score this dummy resume. It is a software engineer. Output JSON with a score."}
    ],
    "temperature": 0.0
  }' > output.json
cat output.json
