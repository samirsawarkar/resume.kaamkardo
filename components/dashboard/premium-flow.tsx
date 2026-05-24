"use client";

import { useState } from "react";
const Button = (props: any) => <button className="px-4 py-2 bg-blue-600 text-white rounded-md" {...props} />;

export function PremiumOptimizerFlow() {
  const [step, setStep] = useState<"UPLOAD" | "EXTRACTING" | "OPTIMIZING" | "VALIDATING" | "RESULTS">("UPLOAD");
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");
  
  const [extractedData, setExtractedData] = useState<any>(null);
  const [optimizedData, setOptimizedData] = useState<any>(null);
  const [jdIntelligence, setJdIntelligence] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const startOptimizationPipeline = async () => {
    try {
      setError(null);
      
      // Step 1: Extraction
      setStep("EXTRACTING");
      const extRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const extData = await extRes.json();
      if (!extRes.ok) throw new Error(extData.error || "Extraction failed");
      setExtractedData(extData.extractedData);

      // Step 2: Optimization (JD Intel + Targeted Rewrite)
      setStep("OPTIMIZING");
      const optRes = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          extractedJson: extData.extractedData, 
          jdText 
        }),
      });
      const optData = await optRes.json();
      if (!optRes.ok) throw new Error(optData.error || "Optimization failed");
      setOptimizedData(optData.optimizedResume);
      setJdIntelligence(optData.jdIntelligence);

      // Step 3: Validation (Quality Gate)
      setStep("VALIDATING");
      const valRes = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optimizedResumeJson: optData.optimizedResume }),
      });
      const valData = await valRes.json();
      if (!valRes.ok) throw new Error(valData.error || "Validation failed");
      
      if (!valData.validation?.passed) {
         console.warn("Validation issues found:", valData.validation?.issues);
         // In production, this would trigger a loop back to the optimizer to auto-fix.
      }

      setStep("RESULTS");

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStep("UPLOAD");
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalOptimizedJson: optimizedData }),
      });
      const data = await res.json();
      
      // Trigger base64 download
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${data.docxBase64}`;
      link.download = data.filename || "Optimized_Resume.docx";
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-card rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Premium JD Optimizer</h2>
      
      {step === "UPLOAD" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Raw Resume Text (Extracted from PDF)</label>
            <textarea 
              className="w-full h-32 p-3 border rounded-md"
              value={resumeText} 
              onChange={e => setResumeText(e.target.value)} 
              placeholder="Paste raw resume text here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Job Description</label>
            <textarea 
              className="w-full h-32 p-3 border rounded-md"
              value={jdText} 
              onChange={e => setJdText(e.target.value)} 
              placeholder="Paste JD here..."
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button onClick={startOptimizationPipeline} disabled={!resumeText || !jdText}>
            Start Premium Optimization
          </Button>
        </div>
      )}

      {step !== "UPLOAD" && step !== "RESULTS" && (
        <div className="py-12 text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <h3 className="text-lg font-medium">
            {step === "EXTRACTING" && "Structuring Resume Data..."}
            {step === "OPTIMIZING" && "Analyzing JD & Rewriting..."}
            {step === "VALIDATING" && "Running ATS Quality Gate..."}
          </h3>
          <p className="text-muted-foreground text-sm">Please do not close this window.</p>
        </div>
      )}

      {step === "RESULTS" && (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-md">
            <h3 className="text-green-600 font-bold mb-2">Optimization Complete!</h3>
            <p className="text-sm">Your resume has been rewritten to match the JD intent.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="border p-4 rounded-md bg-muted/20">
              <h4 className="font-semibold mb-2">Recruiter Intelligence</h4>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Seniority: {jdIntelligence?.jd_intelligence?.seniority}</li>
                <li>Culture: {jdIntelligence?.jd_intelligence?.culture}</li>
                <li>Hidden Keywords: {jdIntelligence?.jd_intelligence?.hidden_keywords?.join(", ")}</li>
              </ul>
            </div>
            <div className="border p-4 rounded-md bg-muted/20">
              <h4 className="font-semibold mb-2">Gap Analysis</h4>
              <ul className="text-sm space-y-1 list-disc pl-4">
                <li>Match Score: {jdIntelligence?.gap_analysis?.match_score}%</li>
                <li>Gaps: {jdIntelligence?.gap_analysis?.gaps?.length || 0} found</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleDownloadDocx}>Download ATS-Safe DOCX</Button>
            <Button variant="outline" onClick={() => setStep("UPLOAD")}>Optimize Another</Button>
          </div>
        </div>
      )}
    </div>
  );
}
