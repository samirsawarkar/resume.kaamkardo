import { runResilientPipeline } from "./lib/core/resilient-orchestrator";
import { normalizeResume, normalizeJD } from "./lib/pipeline/normalizer";

const rawResume = `
Samir Sawarkar
Software Engineer
Pune, India
Email: samir@example.com

Experience
Software Engineer at Acme Corp (2020 - 2023)
- Built a CRM using React.
- Increased sales by 20%.

Projects
Awesome Project (2023)
- Created a cool app using Node.js.

Education
B.Tech in Computer Science from MIT (2016 - 2020)
`;

const rawJD = `
Company: Tech Innovations
Role: Senior Software Engineer
Location: Pune, India
Required Skills: React, Node.js, Typescript
`;

async function run() {
  const generator = runResilientPipeline(rawResume, rawJD);
  
  for await (const event of generator) {
    console.log(event.progress + "% - " + event.message);
    if (event.status === 'complete') {
       console.log("FINAL OUTPUT:");
       console.log(JSON.stringify(event.payload?.resumeJSON, null, 2));
    }
  }
}
run().catch(console.error);
