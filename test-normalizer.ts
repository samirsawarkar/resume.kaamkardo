import { normalizeResume } from "./lib/pipeline/normalizer";

const rawResume = `
Samir Sawarkar
Software Engineer
Pune, India
Email: samir@example.com

Experience
Software Engineer at Acme Corp (2020 - 2023)
- Built a CRM using React.
- Increased sales by 20%.

Education
B.Tech in Computer Science from MIT (2016 - 2020)
`;

normalizeResume(rawResume).then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error);
